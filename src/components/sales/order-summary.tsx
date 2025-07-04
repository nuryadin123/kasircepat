'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SaleItem } from '@/types';
import { X, MinusCircle, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface OrderSummaryProps {
  items: SaleItem[];
  onItemRemove: (productId: string) => void;
  onQuantityChange: (productId: string, newQuantity: number) => void;
  onCheckout: () => void;
}

export function OrderSummary({ items, onItemRemove, onQuantityChange, onCheckout }: OrderSummaryProps) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const discountPercentage = 14.5;
  const discountAmount = subtotal * (discountPercentage / 100);
  const total = subtotal - discountAmount;

  return (
    <Card className="h-full flex flex-col md:rounded-lg">
      <CardHeader>
        <CardTitle className="font-headline">Pesanan Saat Ini</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-6 overflow-y-auto">
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              Belum ada item yang dipilih.
            </p>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onQuantityChange(item.productId, item.quantity - 1)}>
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                            const newQuantity = parseInt(e.target.value, 10);
                            if (!isNaN(newQuantity)) {
                                onQuantityChange(item.productId, newQuantity >= 0 ? newQuantity : 0);
                            }
                        }}
                        className="h-8 w-14 text-center"
                        min="0"
                    />
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onQuantityChange(item.productId, item.quantity + 1)}>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    Rp{new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}
                  </p>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => onItemRemove(item.productId)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2 pt-6 mt-auto border-t">
        <Separator />
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>Rp{new Intl.NumberFormat('id-ID').format(subtotal)}</span>
        </div>
        {discountPercentage > 0 && (
          <div className="flex justify-between text-primary font-medium">
            <span>Diskon ({discountPercentage}%)</span>
            <span>-Rp{new Intl.NumberFormat('id-ID').format(discountAmount)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>Rp{new Intl.NumberFormat('id-ID').format(total)}</span>
        </div>
        <Button size="lg" className="mt-4" onClick={onCheckout} disabled={items.length === 0}>
          Bayar
        </Button>
      </CardFooter>
    </Card>
  );
}
