'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SaleItem, Customer } from '@/types';
import { X, MinusCircle, PlusCircle, User, Percent } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrderSummaryProps {
  items: SaleItem[];
  customers: Customer[];
  selectedCustomerId: string | null;
  onItemRemove: (productId: string) => void;
  onQuantityChange: (productId: string, newQuantity: number) => void;
  onCheckout: () => void;
  onCustomerSelect: (customerId: string | null) => void;
}

export function OrderSummary({ items, customers, selectedCustomerId, onItemRemove, onQuantityChange, onCheckout, onCustomerSelect }: OrderSummaryProps) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const discountPercentage = selectedCustomer?.discount || 0;
  const discountAmount = subtotal * (discountPercentage / 100);
  const discountedSubtotal = subtotal - discountAmount;
  
  const tax = discountedSubtotal * 0.11;
  const total = discountedSubtotal + tax;

  return (
    <Card className="h-full flex flex-col md:rounded-lg">
      <CardHeader>
        <CardTitle className="font-headline">Pesanan Saat Ini</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-6 overflow-y-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="customer-select" className="text-sm font-medium">Pelanggan</label>
            <Select
              value={selectedCustomerId || 'umum'}
              onValueChange={(value) => onCustomerSelect(value === 'umum' ? null : value)}
            >
              <SelectTrigger id="customer-select" className="w-full">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Pilih pelanggan..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="umum">Pelanggan Umum</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex justify-between w-full items-center">
                      <span>{customer.name}</span>
                      {customer.discount > 0 && <span className="text-xs text-muted-foreground flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full"><Percent className="h-3 w-3" /> {customer.discount}%</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator />
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
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onQuantityChange(item.productId, item.quantity - 1)} disabled={item.quantity <= 1}>
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <span>{item.quantity}</span>
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
        {discountAmount > 0 && (
          <div className="flex justify-between text-primary font-medium">
            <span>Diskon ({discountPercentage}%)</span>
            <span>-Rp{new Intl.NumberFormat('id-ID').format(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>Pajak (11%)</span>
          <span>Rp{new Intl.NumberFormat('id-ID').format(tax)}</span>
        </div>
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
