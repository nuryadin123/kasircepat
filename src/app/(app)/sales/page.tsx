'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/shared/header';
import { OrderSummary } from '@/components/sales/order-summary';
import { ProductSelector } from '@/components/sales/product-selector';
import type { Product, SaleItem, Sale } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ReceiptDialog } from '@/components/sales/receipt-dialog';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, runTransaction, getDoc, query, where } from 'firebase/firestore';
import { Loader2, FileUp } from 'lucide-react';
import { SalesImportDialog } from '@/components/sales/sales-import-dialog';
import type { ImportSaleOutput } from '@/ai/flows/import-sale-from-pdf-flow';
import { Button } from '@/components/ui/button';

const DISCOUNT_PERCENTAGE_KEY = 'discountPercentage';

type CartItemWithId = SaleItem & { cartId: string };

function SalesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItemWithId[]>([]);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState(14.5);
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [isLoadingSale, setIsLoadingSale] = useState(false);
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [cashier, setCashier] = useState<{ id: string; name: string } | null>(null);


  useEffect(() => {
    setHasMounted(true);
    const cashierId = localStorage.getItem('userUID');
    const cashierName = localStorage.getItem('userName');
    if (cashierId && cashierName) {
      setCashier({ id: cashierId, name: cashierName });
    }
  }, []);

  useEffect(() => {
    const updateDiscount = () => {
      const savedDiscount = localStorage.getItem(DISCOUNT_PERCENTAGE_KEY);
      if (savedDiscount) {
        setDiscountPercentage(parseFloat(savedDiscount) || 0);
      }
    };
    updateDiscount();
    window.addEventListener('settings_updated', updateDiscount);
    return () => {
      window.removeEventListener('settings_updated', updateDiscount);
    };
  }, []);

  useEffect(() => {
    const fetchAndSortProducts = async () => {
      try {
        const productsCol = collection(db, 'products');
        const salesCol = collection(db, 'sales');
        
        const [productSnapshot, salesSnapshot] = await Promise.all([
            getDocs(productsCol),
            getDocs(salesCol)
        ]);

        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const salesList: Sale[] = salesSnapshot.docs.map(doc => doc.data() as Sale);

        const salesCount: { [productId: string]: number } = {};
        salesList.forEach(sale => {
            if (sale.items && Array.isArray(sale.items)) {
                sale.items.forEach(item => {
                    salesCount[item.productId] = (salesCount[item.productId] || 0) + item.quantity;
                });
            }
        });

        const sortedProducts = productList
            .map(product => ({
                ...product,
                totalSold: salesCount[product.id] || 0
            }))
            .sort((a, b) => {
                if (b.totalSold !== a.totalSold) {
                    return b.totalSold - a.totalSold;
                }
                return a.name.localeCompare(b.name);
            });
            
        setProducts(sortedProducts);
      } catch (error) {
        console.error("Error fetching and sorting products: ", error);
        toast({
          title: "Gagal Memuat Produk",
          description: "Tidak dapat mengambil data produk dari server.",
          variant: "destructive",
        })
      }
    };
    
    fetchAndSortProducts();
  }, [toast]);

  useEffect(() => {
    const saleId = searchParams.get('edit');
    if (saleId) {
      setIsLoadingSale(true);
      const fetchSaleForEditing = async () => {
        try {
          const saleRef = doc(db, 'sales', saleId);
          const saleSnap = await getDoc(saleRef);
          if (saleSnap.exists()) {
            const saleData = { id: saleSnap.id, ...saleSnap.data() } as Sale;
            const cartItemsWithId = saleData.items.map((item) => ({
                ...item,
                cartId: crypto.randomUUID(),
            }));
            setCart(cartItemsWithId);
            setEditingSaleId(saleId);
            setTransactionDate(new Date(saleData.date)); // Set the date from the existing sale
            // Update cashier info from the sale, if it exists
            if (saleData.cashierId && saleData.cashierName) {
              setCashier({ id: saleData.cashierId, name: saleData.cashierName });
            }
          } else {
            toast({ title: 'Error', description: 'Transaksi penjualan tidak ditemukan.', variant: 'destructive' });
            router.push('/reports');
          }
        } catch (error) {
          console.error("Error fetching sale for edit: ", error);
          toast({ title: 'Error', description: 'Gagal memuat data penjualan untuk diedit.', variant: 'destructive' });
        } finally {
            setIsLoadingSale(false);
        }
      };
      fetchSaleForEditing();
    } else {
        // If there's no edit id, reset to new sale mode
        setCart([]);
        setEditingSaleId(null);
        setTransactionDate(new Date()); // Reset to current date
    }
  }, [searchParams, router, toast]);

  const handleProductSelect = (product: Product) => {
    setCart((prevCart) => {
      const newCart = [
        ...prevCart,
        {
          cartId: crypto.randomUUID(),
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          quantity: 1,
          cost: product.cost,
        },
      ];
      return newCart;
    });
  };

  const handleQuantityChange = (cartId: string, newQuantity: number) => {
    if (newQuantity < 1) {
        handleItemRemove(cartId);
        return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartId === cartId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleItemRemove = (cartId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };
  
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    const itemsToSave: SaleItem[] = cart.map(({ cartId, ...rest }) => rest);

    if (editingSaleId) {
        // Update logic
        try {
            const saleRef = doc(db, 'sales', editingSaleId);
            
            await runTransaction(db, async (transaction) => {
                const saleSnap = await transaction.get(saleRef);
                if (!saleSnap.exists()) {
                    throw new Error("Sale document not found during transaction.");
                }
                const existingSaleData = saleSnap.data();
                const transactionId = existingSaleData.transactionId;

                const subtotal = itemsToSave.reduce((acc, item) => acc + item.price * item.quantity, 0);
                const discountAmount = subtotal * (discountPercentage / 100);
                const total = subtotal - discountAmount;
                const totalCost = itemsToSave.reduce((acc, item) => acc + (item.cost || 0) * item.quantity, 0);
                const writeTime = transactionDate;

                // 1. Update the sale document
                transaction.update(saleRef, { 
                    items: itemsToSave, 
                    subtotal, 
                    discountAmount, 
                    total, 
                    date: writeTime,
                    // Note: We don't update the cashier on edit to preserve the original transaction record
                });

                // 2. Update or delete the COGS cash-flow entry
                if (transactionId) {
                    const cogsQuery = query(
                        collection(db, 'cash-flow'), 
                        where('description', '==', `Biaya Pokok Penjualan ${transactionId}`)
                    );
                    const cogsQuerySnapshot = await getDocs(cogsQuery);
                    
                    if (!cogsQuerySnapshot.empty) {
                        const cogsDocRef = cogsQuerySnapshot.docs[0].ref;
                        if (totalCost > 0) {
                            transaction.update(cogsDocRef, { amount: totalCost, date: writeTime });
                        } else {
                            transaction.delete(cogsDocRef);
                        }
                    } else if (totalCost > 0) { // Old entry not found, but a new one is needed
                         const newExpenseRef = doc(collection(db, 'cash-flow'));
                         transaction.set(newExpenseRef, {
                            date: writeTime,
                            type: 'Pengeluaran',
                            description: `Biaya Pokok Penjualan ${transactionId}`,
                            amount: totalCost,
                            category: 'Biaya Pokok Penjualan',
                        });
                    }
                }
            });

            toast({ title: "Sukses", description: "Penjualan berhasil diperbarui." });
            router.push('/reports');
        } catch (error: any) {
            console.error("Error updating transaction: ", error);
            toast({ 
                title: "Gagal Memperbarui", 
                description: `Terjadi kesalahan saat menyimpan perubahan: ${error.message}`, 
                variant: "destructive" 
            });
        }
    } else {
        // Create Logic
         try {
            if (!cashier) {
                throw new Error("Informasi kasir tidak ditemukan.");
            }
            const newSale = await runTransaction(db, async (transaction) => {
                const counterRef = doc(db, 'counters', 'sales');
                const counterDoc = await transaction.get(counterRef);

                let newTransactionNumber = 1;
                if (counterDoc.exists()) {
                    newTransactionNumber = counterDoc.data().lastNumber + 1;
                }
                const formattedTransactionId = `TRX-${String(newTransactionNumber).padStart(5, '0')}`;
                
                const subtotal = itemsToSave.reduce((acc, item) => acc + item.price * item.quantity, 0);
                const discountAmount = subtotal * (discountPercentage / 100);
                const total = subtotal - discountAmount;
                const totalCost = itemsToSave.reduce((acc, item) => acc + (item.cost || 0) * item.quantity, 0);

                const newSaleRef = doc(collection(db, "sales"));
                const saleData = {
                    transactionId: formattedTransactionId,
                    date: transactionDate,
                    items: itemsToSave,
                    subtotal,
                    discountAmount,
                    total,
                    paymentMethod: 'Card' as const,
                    cashierId: cashier.id,
                    cashierName: cashier.name,
                };
                transaction.set(newSaleRef, saleData);
                
                if (totalCost > 0) {
                    const expenseRef = doc(collection(db, 'cash-flow'));
                    const expenseData = {
                        date: transactionDate,
                        type: 'Pengeluaran',
                        description: `Biaya Pokok Penjualan ${formattedTransactionId}`,
                        amount: totalCost,
                        category: 'Biaya Pokok Penjualan',
                    };
                    transaction.set(expenseRef, expenseData);
                }

                transaction.set(counterRef, { lastNumber: newTransactionNumber });

                return {
                    ...saleData,
                    id: newSaleRef.id,
                    date: saleData.date.toISOString(),
                } as Sale;
            });
            
            setLastSale(newSale);
            setCart([]);
            setIsReceiptOpen(true);
            toast({
                title: "Transaksi Berhasil",
                description: "Penjualan telah berhasil diproses.",
            });
        } catch (error: any) {
            console.error("Error processing transaction: ", error);
            toast({
                title: "Transaksi Gagal",
                description: `Terjadi kesalahan saat memproses penjualan: ${error.message}`,
                variant: "destructive",
            });
        }
    }
  };
  
  const handlePdfImport = (data: ImportSaleOutput) => {
    // Build maps for efficient lookup, normalizing keys to be case-insensitive and trimmed.
    const productMapBySku = new Map<string, Product>();
    const productMapByName = new Map<string, Product>();
    products.forEach(p => {
      if (p.sku) {
        productMapBySku.set(p.sku.trim().toLowerCase(), p);
      }
      productMapByName.set(p.name.trim().toLowerCase(), p);
    });

    let matchedBySkuCount = 0;
    let matchedByNameCount = 0;
    const unmatchedItems: string[] = [];

    const newCartItems: CartItemWithId[] = data.items.map(item => {
      let matchedProduct: Product | undefined = undefined;

      // 1. Try to match by SKU first (case-insensitive, trimmed)
      if (item.sku) {
        matchedProduct = productMapBySku.get(item.sku.trim().toLowerCase());
        if (matchedProduct) {
          matchedBySkuCount++;
        }
      }

      // 2. If no SKU match, fall back to matching by name (case-insensitive, trimmed)
      if (!matchedProduct) {
        matchedProduct = productMapByName.get(item.name.trim().toLowerCase());
        if (matchedProduct) {
          matchedByNameCount++;
        }
      }

      // Create cart item based on whether a match was found
      if (matchedProduct) {
        return {
          cartId: crypto.randomUUID(),
          productId: matchedProduct.id,
          name: matchedProduct.name,
          sku: matchedProduct.sku,
          price: matchedProduct.price,
          cost: matchedProduct.cost,
          quantity: item.quantity,
          isUnmatched: false,
        };
      } else {
        // No match found, add to unmatched list and use PDF data as fallback
        unmatchedItems.push(`- ${item.name} ${item.sku ? `(SKU: ${item.sku})` : ''}`);
        return {
          cartId: crypto.randomUUID(),
          productId: `pdf-import-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
          name: item.name,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
          cost: 0,
          isUnmatched: true,
        };
      }
    });

    setCart(prevCart => [...prevCart, ...newCartItems]);

    if (data.date) {
      const importedDate = new Date(data.date);
      if (!isNaN(importedDate.getTime())) {
        setTransactionDate(importedDate);
      }
    }
    
    // Build a detailed toast message
    const totalImported = newCartItems.length;
    let toastDescription = `${totalImported} item berhasil diekstrak.`;

    if (matchedBySkuCount > 0) toastDescription += ` ${matchedBySkuCount} cocok via SKU.`;
    if (matchedByNameCount > 0) toastDescription += ` ${matchedByNameCount} cocok via Nama.`;

    if (unmatchedItems.length > 0) {
      toastDescription += `\n\nProduk berikut tidak ditemukan di database:\n${unmatchedItems.join('\n')}\n\nItem ini ditambahkan menggunakan data dari PDF. Harap periksa kembali detailnya sebelum checkout.`;
    }

    toast({
      title: 'Impor Selesai',
      description: (
        <div className="whitespace-pre-wrap text-sm">
            {toastDescription}
        </div>
      ),
      duration: unmatchedItems.length > 0 ? 12000 : 5000, // Longer duration if there are unmatched items
    });
  };

  if (!hasMounted || isLoadingSale) {
    return (
        <>
            <Header title={editingSaleId ? 'Memuat Penjualan...' : 'Pemrosesan Penjualan'} />
            {isLoadingSale && (
                <div className="flex items-center justify-center mt-10">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )}
        </>
    );
  }

  return (
    <>
      <Header title={editingSaleId ? 'Edit Penjualan' : 'Pemrosesan Penjualan'} />
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 mt-4 pb-24">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-grow w-full">
            <ProductSelector products={products} onProductSelect={handleProductSelect} />
          </div>
          <SalesImportDialog onImportSuccess={handlePdfImport}>
            <Button variant="outline" className="w-full sm:w-auto">
              <FileUp className="mr-2 h-4 w-4" />
              Impor dari PDF
            </Button>
          </SalesImportDialog>
        </div>
        
        {cart.length > 0 && (
            <OrderSummary 
              items={cart}
              onItemRemove={handleItemRemove}
              onQuantityChange={handleQuantityChange}
              onCheckout={handleCheckout}
              discountPercentage={discountPercentage}
              isEditing={!!editingSaleId}
              transactionDate={transactionDate}
              onDateChange={setTransactionDate}
              cashierName={cashier?.name || 'Kasir'}
            />
        )}
      </div>

      <ReceiptDialog 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={lastSale}
      />
    </>
  );
}


export default function SalesPage() {
    return (
        <Suspense fallback={<Header title="Memuat..." />}>
            <SalesPageContent />
        </Suspense>
    )
}
