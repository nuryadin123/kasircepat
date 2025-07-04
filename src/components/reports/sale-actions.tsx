'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Sale } from '@/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SaleActionsProps {
  sale: Sale;
}

export function SaleActions({ sale }: SaleActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'sales', sale.id));
      toast({ title: 'Sukses', description: 'Laporan penjualan berhasil dihapus.' });
      router.refresh();
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus laporan penjualan.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
    }
  };

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Hapus</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data penjualan secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
             {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
