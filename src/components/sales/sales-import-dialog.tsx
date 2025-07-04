'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileUp } from 'lucide-react';
import { importSaleFromPdf, type ImportSaleOutput } from '@/ai/flows/import-sale-from-pdf-flow';

interface SalesImportDialogProps {
  onImportSuccess: (data: ImportSaleOutput) => void;
  children: React.ReactNode;
}

export function SalesImportDialog({ onImportSuccess, children }: SalesImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'Tidak ada file dipilih',
        description: 'Silakan pilih file PDF untuk diimpor.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const pdfDataUri = reader.result as string;
        const result = await importSaleFromPdf({ pdfDataUri });

        if (!result || !result.items || result.items.length === 0) {
          throw new Error('Tidak ada item yang dapat diekstrak dari PDF.');
        }

        onImportSuccess(result);
        toast({
          title: 'Impor Berhasil',
          description: `${result.items.length} item berhasil diekstrak dan ditambahkan ke pesanan.`,
        });
        setIsOpen(false);
        setFile(null);
      } catch (error: any) {
        console.error('Error importing from PDF:', error);
        toast({
          title: 'Gagal Mengimpor',
          description: error.message || 'Tidak dapat memproses file PDF yang diberikan.',
          variant: 'destructive',
        });
      } finally {
        setIsImporting(false);
      }
    };
    reader.onerror = () => {
      setIsImporting(false);
      toast({
        title: 'Gagal Membaca File',
        description: 'Terjadi kesalahan saat membaca file.',
        variant: 'destructive',
      });
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Impor Penjualan dari PDF</DialogTitle>
          <DialogDescription>
            Pilih file PDF struk atau faktur untuk secara otomatis mengisi item penjualan.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={isImporting}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isImporting}>
            Batal
          </Button>
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
            Impor & Proses
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
