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
import { summarizePurchase } from '@/ai/flows/summarize-purchase';
import type { SaleItem } from '@/types';
import { Loader2, Printer, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface ReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: SaleItem[];
}

export function ReceiptDialog({ isOpen, onClose, items }: ReceiptDialogProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && items.length > 0) {
      const fetchSummary = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const purchaseItems = items.map(item => ({
            name: item.name,
            quantity: item.quantity,
          }));
          const result = await summarizePurchase({ items: purchaseItems });
          setSummary(result.summary);
        } catch (e) {
          console.error(e);
          setError('Gagal membuat ringkasan. Silakan coba lagi.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchSummary();
    }
  }, [isOpen, items]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Ringkasan Pembelian</DialogTitle>
          <DialogDescription>
            Berikut adalah ringkasan pembelian untuk dicetak.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Membuat ringkasan...</p>
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          {!isLoading && !error && summary && (
            <Alert variant="default" className="bg-primary/5">
                <CheckCircle className="h-4 w-4 !text-primary" />
                <AlertTitle>Struk Pembelian</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">{summary}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Tutup
          </Button>
          <Button type="button" onClick={() => window.print()} disabled={isLoading}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
