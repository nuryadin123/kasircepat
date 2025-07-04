'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Sale } from '@/types';

interface SaleDetailDialogProps {
  sale: Sale;
  children: React.ReactNode;
}

export function SaleDetailDialog({ sale, children }: SaleDetailDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const subtotal = sale.subtotal ?? sale.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = sale.discountAmount ?? 0;
  const total = sale.total;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
          <DialogDescription>
            ID Transaksi: {sale.transactionId || sale.id}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="text-sm text-muted-foreground">
            <p>Tanggal: {new Date(sale.date).toLocaleString('id-ID')}</p>
            <p>Kasir: {sale.cashierName || 'Tidak diketahui'}</p>
          </div>
          <Separator />
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            <h4 className="font-medium">Item yang dibeli:</h4>
            {sale.items.map((item, index) => (
              <div key={`${item.productId}-${index}`} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground">
                    {item.quantity} x Rp{new Intl.NumberFormat('id-ID').format(item.price)}
                  </p>
                </div>
                <p>Rp{new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp{new Intl.NumberFormat('id-ID').format(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-primary font-medium">
                <span>Diskon</span>
                <span>-Rp{new Intl.NumberFormat('id-ID').format(discountAmount)}</span>
              </div>
            )}
            <Separator className="my-1" />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>Rp{new Intl.NumberFormat('id-ID').format(total)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
