'use client';

import { useState, useEffect } from 'react';
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
import { Separator } from '@/components/ui/separator';

interface ReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const STORE_NAME_KEY = 'storeName';
const STORE_ADDRESS_KEY = 'storeAddress';

export function ReceiptDialog({ isOpen, onClose, sale }: ReceiptDialogProps) {
  const [storeName, setStoreName] = useState('Kasiran App');
  const [storeAddress, setStoreAddress] = useState('');

  useEffect(() => {
    if (isOpen) {
      const savedStoreName = localStorage.getItem(STORE_NAME_KEY);
      const savedStoreAddress = localStorage.getItem(STORE_ADDRESS_KEY);
      if (savedStoreName) {
        setStoreName(savedStoreName);
      }
      if (savedStoreAddress) {
        setStoreAddress(savedStoreAddress);
      }
    }
  }, [isOpen]);

  if (!sale) {
    return null;
  }
  
  const subtotal = sale.subtotal ?? sale.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = sale.discountAmount ?? 0;
  const total = sale.total;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xs">
        <div id="printable-receipt" className="print:text-black print:bg-white">
          <DialogHeader>
            <DialogTitle className="font-headline text-center">Struk Pembelian</DialogTitle>
            <DialogDescription className="text-center">
              Terima kasih atas pembelian Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 font-mono text-sm">
              <div className="space-y-2">
                  <div className="text-center">
                      <p className="font-bold text-foreground print:text-black">{storeName}</p>
                      {storeAddress && <p className="text-xs text-muted-foreground print:text-black">{storeAddress}</p>}
                      <p className="text-xs text-muted-foreground print:text-black">{new Date(sale.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short'})}</p>
                      <p className="text-xs text-muted-foreground print:text-black truncate">No: {sale.transactionId || sale.id}</p>
                  </div>
                  <Separator className="my-2 border-dashed" />
                  <div className="space-y-2">
                      {sale.items.map((item, index) => (
                          <div key={`${item.productId}-${index}`} className="flex">
                              <div className="flex-1">
                                  <p className="font-medium text-foreground print:text-black">
                                    {item.name}
                                    {item.sku && <span className="text-muted-foreground ml-1">({item.sku})</span>}
                                  </p>
                                  <p className="text-muted-foreground print:text-black">
                                      {item.quantity} x Rp{new Intl.NumberFormat('id-ID').format(item.price)}
                                  </p>
                              </div>
                              <p className="text-foreground print:text-black">Rp{new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}</p>
                          </div>
                      ))}
                  </div>
                  <Separator className="my-2 border-dashed" />
                   <div className="space-y-1">
                      <div className="flex justify-between">
                          <p className="text-muted-foreground print:text-black">Subtotal</p>
                          <p className="text-foreground print:text-black">Rp{new Intl.NumberFormat('id-ID').format(subtotal)}</p>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between">
                            <p className="text-muted-foreground print:text-black">Diskon</p>
                            <p className="text-foreground print:text-black">-Rp{new Intl.NumberFormat('id-ID').format(discountAmount)}</p>
                        </div>
                      )}
                  </div>
                  <Separator className="my-2 border-dashed" />
                  <div className="flex justify-between font-bold text-base">
                      <p className="text-foreground print:text-black">Total</p>
                      <p className="text-foreground print:text-black">Rp{new Intl.NumberFormat('id-ID').format(total)}</p>
                  </div>
                  <div className="text-center mt-4 text-xs">
                      <p className="text-muted-foreground print:text-black">--- Terima Kasih ---</p>
                  </div>
              </div>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="w-full">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
