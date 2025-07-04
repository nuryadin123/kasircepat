'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
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
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const STORE_NAME_KEY = 'storeName';
const STORE_ADDRESS_KEY = 'storeAddress';

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Load settings from localStorage
    const savedStoreName = localStorage.getItem(STORE_NAME_KEY) || 'Kasiran App';
    const savedStoreAddress = localStorage.getItem(STORE_ADDRESS_KEY) || '';
    setStoreName(savedStoreName);
    setStoreAddress(savedStoreAddress);
    setIsLoading(false);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    // Save settings to localStorage
    localStorage.setItem(STORE_NAME_KEY, storeName);
    localStorage.setItem(STORE_ADDRESS_KEY, storeAddress);
    
    // Dispatch a custom event to notify other components of the change
    window.dispatchEvent(new Event('settings_updated'));
    
    setTimeout(() => { // Simulate network delay
        setIsSaving(false);
        toast({
            title: 'Sukses',
            description: 'Pengaturan berhasil disimpan.',
        });
    }, 500);
  };
  
  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      const collectionsToDelete = ['products', 'customers', 'sales', 'cash-flow'];
      const batch = writeBatch(db);

      for (const collectionName of collectionsToDelete) {
        const querySnapshot = await getDocs(collection(db, collectionName));
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
      }
      
      // Also reset the sales counter
      const counterRef = doc(db, 'counters', 'sales');
      batch.set(counterRef, { lastNumber: 0 });

      await batch.commit();

      toast({
        title: 'Sukses',
        description: 'Semua data transaksi dan riwayat telah berhasil dihapus.',
      });

      router.refresh(); // Refresh data on all pages
    } catch (error) {
      console.error("Error deleting all data:", error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus data. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
      return (
           <>
              <Header title="Pengaturan" />
              <div className="flex items-center justify-center mt-10">
                  <Loader2 className="h-8 w-8 animate-spin" />
              </div>
           </>
      )
  }

  return (
    <>
      <Header title="Pengaturan" />
      <div className="flex flex-col gap-8 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Profil Toko</CardTitle>
            <CardDescription>
              Informasi dasar mengenai toko atau bisnis Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Nama Toko</Label>
              <Input 
                id="store-name" 
                placeholder="Masukkan nama toko" 
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address">Alamat Toko</Label>
              <Input 
                id="store-address" 
                placeholder="Masukkan alamat toko" 
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tampilan</CardTitle>
            <CardDescription>
              Atur tema tampilan aplikasi.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
             <Label>Mode Gelap/Terang</Label>
             <ThemeToggle />
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Zona Berbahaya</CardTitle>
            <CardDescription>
              Tindakan di area ini tidak dapat dibatalkan. Lanjutkan dengan hati-hati.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus Semua Data
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Ini akan menghapus semua produk, penjualan, pelanggan, dan data arus kas secara permanen dari database.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isDeleting}
                        onClick={handleDeleteAllData}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Ya, Hapus Semua Data
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
