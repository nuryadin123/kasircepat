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
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag } from 'lucide-react';

const DISCOUNT_PERCENTAGE_KEY = 'discountPercentage';

function SalesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState(14.5);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [isLoadingSale, setIsLoadingSale] = useState(false);


  useEffect(() => {
    setHasMounted(true);
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
    const fetchProducts = async () => {
      try {
        const productsCol = collection(db, 'products');
        const productSnapshot = await getDocs(productsCol);
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products: ", error);
        toast({
          title: "Gagal Memuat Produk",
          description: "Tidak dapat mengambil data produk dari server.",
          variant: "destructive",
        })
      }
    };
    
    fetchProducts();
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
            setCart(saleData.items);
            setEditingSaleId(saleId);
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
    }
  }, [searchParams, router, toast]);

  const handleProductSelect = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          cost: product.cost,
        },
      ];
    });
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
        handleItemRemove(productId);
        return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleItemRemove = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };
  
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    if (editingSaleId) {
        // Update logic
        try {
            const saleRef = doc(db, 'sales', editingSaleId);

            // --- PRE-TRANSACTION READS ---
            const initialSaleSnap = await getDoc(saleRef);
            if (!initialSaleSnap.exists()) {
                throw new Error("Sale document to edit was not found.");
            }
            const transactionId = initialSaleSnap.data().transactionId;

            // Find the COGS document outside the transaction to avoid the query issue
            let cogsDocId: string | null = null;
            if (transactionId) {
                const cogsQuery = query(
                    collection(db, 'cash-flow'), 
                    where('description', '==', `Biaya Pokok Penjualan ${transactionId}`)
                );
                const cogsQuerySnapshot = await getDocs(cogsQuery);
                if (!cogsQuerySnapshot.empty) {
                    cogsDocId = cogsQuerySnapshot.docs[0].id;
                }
            }
            
            // --- TRANSACTION ---
            await runTransaction(db, async (transaction) => {
                // --- READ PHASE (within transaction) ---
                // Re-read sale document for consistency
                const saleSnap = await transaction.get(saleRef);
                if (!saleSnap.exists()) {
                    throw new Error("Sale document not found during transaction.");
                }

                // --- WRITE PHASE (within transaction) ---
                const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
                const discountAmount = subtotal * (discountPercentage / 100);
                const total = subtotal - discountAmount;
                const totalCost = cart.reduce((acc, item) => acc + (item.cost || 0) * item.quantity, 0);
                const writeTime = new Date();

                // 1. Update the sale document
                transaction.update(saleRef, { 
                    items: cart, 
                    subtotal, 
                    discountAmount, 
                    total, 
                    date: writeTime 
                });

                // 2. Update, create, or delete the COGS cash-flow entry
                if (cogsDocId) { // Old COGS entry exists
                    const cogsDocRef = doc(db, 'cash-flow', cogsDocId);
                    if (totalCost > 0) {
                        // Update it with the new cost
                        transaction.update(cogsDocRef, { amount: totalCost, date: writeTime });
                    } else {
                        // The new cost is 0, so delete the old entry
                        transaction.delete(cogsDocRef);
                    }
                } else if (transactionId && totalCost > 0) { // No old entry, but a new one is needed
                    const newExpenseRef = doc(collection(db, 'cash-flow'));
                    transaction.set(newExpenseRef, {
                        date: writeTime,
                        type: 'Pengeluaran',
                        description: `Biaya Pokok Penjualan ${transactionId}`,
                        amount: totalCost,
                        category: 'Biaya Pokok Penjualan',
                    });
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
            const newSale = await runTransaction(db, async (transaction) => {
                const counterRef = doc(db, 'counters', 'sales');
                const counterDoc = await transaction.get(counterRef);

                let newTransactionNumber = 1;
                if (counterDoc.exists()) {
                    newTransactionNumber = counterDoc.data().lastNumber + 1;
                }
                const formattedTransactionId = `TRX-${String(newTransactionNumber).padStart(5, '0')}`;
                
                const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
                const discountAmount = subtotal * (discountPercentage / 100);
                const total = subtotal - discountAmount;
                const totalCost = cart.reduce((acc, item) => acc + (item.cost || 0) * item.quantity, 0);

                const newSaleRef = doc(collection(db, "sales"));
                const saleData = {
                    transactionId: formattedTransactionId,
                    date: new Date(),
                    items: cart,
                    subtotal,
                    discountAmount,
                    total,
                    paymentMethod: 'Card' as const,
                };
                transaction.set(newSaleRef, saleData);
                
                if (totalCost > 0) {
                    const expenseRef = doc(collection(db, 'cash-flow'));
                    const expenseData = {
                        date: new Date(),
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
        } catch (error) {
        console.error("Error processing transaction: ", error);
        toast({
            title: "Transaksi Gagal",
            description: "Terjadi kesalahan saat memproses penjualan.",
            variant: "destructive",
        });
        }
    }
  };
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = subtotal * (discountPercentage / 100);
  const total = subtotal - discountAmount;

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
      <div className="grid md:grid-cols-[1fr_400px] gap-8 items-start mt-4 pb-24 md:pb-0">
        <ProductSelector products={products} onProductSelect={handleProductSelect} />
        
        <div className="hidden md:block sticky top-4">
          <OrderSummary 
            items={cart}
            onItemRemove={handleItemRemove}
            onQuantityChange={handleQuantityChange}
            onCheckout={handleCheckout}
            discountPercentage={discountPercentage}
            isEditing={!!editingSaleId}
          />
        </div>
      </div>
      
      {isMobile && cart.length > 0 && (
        <Sheet>
          <SheetTrigger asChild>
            <Button className="fixed bottom-4 inset-x-4 h-auto p-3 rounded-lg shadow-lg z-20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6" />
                <span className="font-semibold">{totalItems} Item</span>
              </div>
              <span className="font-bold text-base">Rp{new Intl.NumberFormat('id-ID').format(total)}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0">
            <SheetTitle className="sr-only">Ringkasan Pesanan</SheetTitle>
             <OrderSummary 
              items={cart}
              onItemRemove={handleItemRemove}
              onQuantityChange={handleQuantityChange}
              onCheckout={handleCheckout}
              discountPercentage={discountPercentage}
              isEditing={!!editingSaleId}
            />
          </SheetContent>
        </Sheet>
      )}

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
