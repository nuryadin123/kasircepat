'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SaleItem } from '@/types';
import { X, MinusCircle, PlusCircle, Calendar as CalendarIcon, User, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type CartItemWithId = SaleItem & { cartId: string };

interface OrderSummaryProps {
  items: CartItemWithId[];
  onItemRemove: (cartId: string) => void;
  onQuantityChange: (cartId: string, newQuantity: number) => void;
  onCheckout: () => void;
  discountPercentage: number;
  isEditing?: boolean;
  transactionDate: Date;
  onDateChange: (date: Date) => void;
  cashierName: string;
}

export function OrderSummary({ 
  items, 
  onItemRemove, 
  onQuantityChange, 
  onCheckout, 
  discountPercentage, 
  isEditing,
  transactionDate,
  onDateChange,
  cashierName
}: OrderSummaryProps) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = subtotal * (discountPercentage / 100);
  const total = subtotal - discountAmount;

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col md:rounded-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                  <CardTitle className="font-headline">Pesanan Saat Ini</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4" />
                      {cashierName}
                  </CardDescription>
              </div>
              <Popover>
                  <PopoverTrigger asChild>
                      <Button
                          variant={"outline"}
                          className={cn(
                              "w-[240px] justify-start text-left font-normal",
                              !transactionDate && "text-muted-foreground"
                          )}
                      >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {transactionDate ? format(transactionDate, "PPP", { locale: indonesiaLocale }) : <span>Pilih tanggal</span>}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                          mode="single"
                          selected={transactionDate}
                          onSelect={(date) => date && onDateChange(date)}
                          initialFocus
                      />
                  </PopoverContent>
              </Popover>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-6 pt-2 overflow-y-auto">
          <div className="space-y-4">
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">
                Belum ada item yang dipilih.
              </p>
            ) : (
              items.map((item) => (
                <div 
                  key={item.cartId} 
                  className={cn(
                    "flex items-center gap-4 transition-all",
                    item.isUnmatched && "bg-yellow-50 dark:bg-yellow-950/50 p-3 -mx-3 rounded-lg border border-yellow-300 dark:border-yellow-800"
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium">{item.name}</p>
                      {item.isUnmatched && (
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Produk tidak ditemukan di database.<br/>Harga & detail diambil dari PDF.<br/>Biaya modal diatur ke 0.</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {item.sku && <p className="text-sm text-muted-foreground">{`SKU: ${item.sku}`}</p>}
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onQuantityChange(item.cartId, item.quantity - 1)}>
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                              const newQuantity = parseInt(e.target.value, 10);
                              if (!isNaN(newQuantity)) {
                                  onQuantityChange(item.cartId, newQuantity >= 0 ? newQuantity : 0);
                              }
                          }}
                          className="h-8 w-14 text-center"
                          min="0"
                      />
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onQuantityChange(item.cartId, item.quantity + 1)}>
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      Rp{new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}
                    </p>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => onItemRemove(item.cartId)}>
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
            {isEditing ? 'Simpan Perubahan' : 'Bayar'}
          </Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
