'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/shared/header';
import { OrderSummary } from '@/components/sales/order-summary';
import { ProductSelector } from '@/components/sales/product-selector';
import type { Product, SaleItem, Customer, Sale } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ReceiptDialog } from '@/components/sales/receipt-dialog';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
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
    
    const fetchCustomers = async () => {
        try {
            const customersCol = query(collection(db, 'customers'), orderBy('name', 'asc'));
            const customerSnapshot = await getDocs(customersCol);
            const customerList = customerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
            setCustomers(customerList);
        } catch (error) {
            console.error("Error fetching customers: ", error);
            toast({
                title: "Gagal Memuat Pelanggan",
                description: "Tidak dapat mengambil data pelanggan dari server.",
                variant: "destructive",
            })
        }
    };

    fetchProducts();
    fetchCustomers();
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
      const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const tax = subtotal * 0.11;
      const total = subtotal + tax;
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

      const saleData = {
        date: serverTimestamp(),
        items: cart,
        total: total,
        paymentMethod: 'Card', // Hardcoded for now
        ...(selectedCustomer && { customer: selectedCustomer })
      };

      const docRef = await addDoc(collection(db, "sales"), saleData);
      
      const newSale: Sale = {
          id: docRef.id,
          date: new Date().toISOString(),
          items: [...cart],
          total,
          paymentMethod: 'Card',
          customer: selectedCustomer,
      };
      
      setLastSale(newSale);
      setCart([]);
      setSelectedCustomerId(null);
      setIsReceiptOpen(true);
      toast({
          title: "Transaksi Berhasil",
          description: "Penjualan telah berhasil diproses.",
      });
    } catch (error) {
       console.error("Error adding document: ", error);
       toast({
        title: "Transaksi Gagal",
        description: "Terjadi kesalahan saat memproses penjualan.",
        variant: "destructive",
      });
    }
  };
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

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
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onCustomerSelect={setSelectedCustomerId}
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
              customers={customers}
              selectedCustomerId={selectedCustomerId}
              onCustomerSelect={setSelectedCustomerId}
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
