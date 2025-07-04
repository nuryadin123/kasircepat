'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/shared/header';
import { OrderSummary } from '@/components/sales/order-summary';
import { ProductSelector } from '@/components/sales/product-selector';
import type { Product, SaleItem, Sale } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ReceiptDialog } from '@/components/sales/receipt-dialog';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, runTransaction } from 'firebase/firestore';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
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
        const discountPercentage = 14.5;
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
                date: new Date().toISOString(),
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
  };
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountPercentage = 14.5;
  const discountAmount = subtotal * (discountPercentage / 100);
  const total = subtotal - discountAmount;

  if (!hasMounted) {
    return (
        <>
            <Header title="Pemrosesan Penjualan" />
        </>
    );
  }

  return (
    <>
      <Header title="Pemrosesan Penjualan" />
      <div className="grid md:grid-cols-[1fr_400px] gap-8 items-start mt-4 pb-24 md:pb-0">
        <ProductSelector products={products} onProductSelect={handleProductSelect} />
        
        <div className="hidden md:block sticky top-4">
          <OrderSummary 
            items={cart}
            onItemRemove={handleItemRemove}
            onQuantityChange={handleQuantityChange}
            onCheckout={handleCheckout}
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
