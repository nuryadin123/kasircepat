'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as xlsx from 'xlsx';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
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
import { Loader2 } from 'lucide-react';

interface ProductImportDialogProps {
  children: React.ReactNode;
}

export function ProductImportDialog({ children }: ProductImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'File tidak ditemukan',
        description: 'Silakan pilih file Excel terlebih dahulu.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = xlsx.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = xlsx.utils.sheet_to_json(worksheet) as any[];

          if (!jsonData || jsonData.length === 0) {
            throw new Error('File Excel kosong atau format tidak valid.');
          }

          const batch = writeBatch(db);
          let importedCount = 0;

          jsonData.forEach((row) => {
            const name = row['nama prodak'] || row['Nama Produk'] || row['name'];
            const price = row['harga jual'] || row['Harga Jual'] || row['price'];
            const cost = row['harga modal'] || row['Harga Modal'] || row['cost'];
            const sku = row['sku'] || row['SKU'];

            if (name && typeof price === 'number' && typeof cost === 'number') {
              const productRef = doc(collection(db, 'products'));
              batch.set(productRef, {
                name: String(name),
                sku: String(sku || ''),
                price: Number(price),
                cost: Number(cost),
                stock: row['stok'] || row['Stok'] || row['stock'] || 0,
                createdAt: new Date().toISOString(),
              });
              importedCount++;
            }
          });

          if (importedCount === 0) {
             throw new Error('Tidak ada data produk yang valid untuk diimpor. Periksa nama kolom Anda.');
          }

          await batch.commit();

          toast({
            title: 'Impor Berhasil',
            description: `${importedCount} produk berhasil diimpor.`,
          });

          setFile(null);
          setIsOpen(false);
          router.refresh();
        } catch (error: any) {
          console.error('Error parsing or saving data:', error);
          toast({
            title: 'Impor Gagal',
            description: error.message || 'Terjadi kesalahan saat memproses file.',
            variant: 'destructive',
          });
        } finally {
          setIsImporting(false);
        }
      };
      reader.onerror = (error) => {
         console.error('FileReader error:', error);
         toast({
            title: 'Gagal Membaca File',
            description: 'Tidak dapat membaca file yang dipilih.',
            variant: 'destructive',
          });
         setIsImporting(false);
      }
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error setting up FileReader:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'destructive',
      });
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
            setFile(null);
        }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Impor Produk dari Excel</DialogTitle>
          <DialogDescription>
            Pilih file .xlsx untuk mengimpor data produk secara massal. Pastikan file Anda memiliki kolom: `nama prodak`, `harga jual`, dan `harga modal`. Kolom opsional: `stok`, `sku`.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="import-file"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileSelect}
            disabled={isImporting}
          />
        </div>
        <DialogFooter>
           <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isImporting}>Batal</Button>
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Impor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
