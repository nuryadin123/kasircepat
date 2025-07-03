'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Sale } from '@/types';
import { Printer } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export function ReceiptDialog({ isOpen, onClose, sale }: ReceiptDialogProps) {
  if (!sale) {
    return null;
  }
  
  const subtotal = sale.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.11;
  const total = sale.total;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xs">
        <div id="printable-receipt">
          <DialogHeader className="print:hidden">
            <DialogTitle className="font-headline text-center">Struk Pembelian</DialogTitle>
            <DialogDescription className="text-center">
              Terima kasih atas pembelian Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 font-mono text-sm">
              <div className="space-y-2">
                  <div className="text-center text-muted-foreground">
                      <p className="font-bold text-black">Kasiran App</p>
                      <p className="text-xs text-black">{new Date(sale.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short'})}</p>
                      <p className="text-xs text-black truncate">ID: {sale.id}</p>
                      {sale.customer && <p className="text-xs text-black">Pelanggan: {sale.customer.name}</p>}
                  </div>
                  <Separator className="my-2 border-dashed" />
                  <div className="space-y-2">
                      {sale.items.map((item) => (
                          <div key={item.productId} className="flex">
                              <div className="flex-1">
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-muted-foreground">
                                      {item.quantity} x Rp{new Intl.NumberFormat('id-ID').format(item.price)}
                                  </p>
                              </div>
                              <p>Rp{new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}</p>
                          </div>
                      ))}
                  </div>
                  <Separator className="my-2 border-dashed" />
                   <div className="space-y-1">
                      <div className="flex justify-between">
                          <p className="text-muted-foreground">Subtotal</p>
                          <p>Rp{new Intl.NumberFormat('id-ID').format(subtotal)}</p>
                      </div>
                      <div className="flex justify-between">
                          <p className="text-muted-foreground">Pajak (11%)</p>
                          <p>Rp{new Intl.NumberFormat('id-ID').format(tax)}</p>
                      </div>
                  </div>
                  <Separator className="my-2 border-dashed" />
                  <div className="flex justify-between font-bold text-base">
                      <p>Total</p>
                      <p>Rp{new Intl.NumberFormat('id-ID').format(total)}</p>
                  </div>
                  <div className="text-center text-muted-foreground mt-4 text-xs">
                      <p>--- Terima Kasih ---</p>
                  </div>
              </div>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 pt-4 print:hidden">
          <Button type="button" onClick={() => window.print()} className="w-full">
            <Printer className="mr-2 h-4 w-4" />
            Cetak Struk
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="w-full">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
