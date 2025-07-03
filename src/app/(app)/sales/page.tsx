'use client';

import { useState } from 'react';
import { Header } from '@/components/shared/header';
import { OrderSummary } from '@/components/sales/order-summary';
import { ProductSelector } from '@/components/sales/product-selector';
import type { Product, SaleItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ReceiptDialog } from '@/components/sales/receipt-dialog';

export default function SalesPage() {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<SaleItem[]>([]);
  const { toast } = useToast();

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
  
  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // In a real app, this would process payment and save the sale.
    setLastOrder([...cart]);
    setCart([]);
    setIsReceiptOpen(true);
    toast({
        title: "Transaksi Berhasil",
        description: "Penjualan telah berhasil diproses.",
    });
  };

  return (
    <>
      <Header title="Pemrosesan Penjualan" />
      <div className="grid md:grid-cols-[1fr_400px] gap-8 items-start mt-4">
        <ProductSelector onProductSelect={handleProductSelect} />
        <OrderSummary 
          items={cart}
          onItemRemove={handleItemRemove}
          onQuantityChange={handleQuantityChange}
          onCheckout={handleCheckout}
        />
      </div>
      <ReceiptDialog 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        items={lastOrder}
      />
    </>
  );
}
