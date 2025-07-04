'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Upload, Search, Loader2, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns, productActions } from '@/components/products/columns';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, writeBatch } from 'firebase/firestore';
import type { Product } from '@/types';
import { ProductFormDialog } from '@/components/products/product-form-dialog';
import { ProductImportDialog } from '@/components/products/product-import-dialog';
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
import { useToast } from '@/hooks/use-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      router.replace('/sales');
      return;
    }

    async function getProducts() {
      try {
        const productsCol = query(collection(db, 'products'), orderBy('name', 'asc'));
        const productSnapshot = await getDocs(productsCol);
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productList);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getProducts();
  }, [router]);

  const handleDeleteAllProducts = async () => {
    setIsDeletingAll(true);
    try {
      const productsCol = collection(db, 'products');
      const productSnapshot = await getDocs(productsCol);
      if (productSnapshot.empty) {
        toast({ title: 'Tidak Ada Produk', description: 'Tidak ada produk untuk dihapus.' });
        return;
      }

      const batch = writeBatch(db);
      productSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      toast({ title: 'Sukses', description: 'Semua produk berhasil dihapus.' });
      router.refresh();
    } catch (error) {
      console.error("Failed to delete all products:", error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus semua produk.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <>
        <Header title="Manajemen Produk" />
        <div className="flex items-center justify-center mt-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Manajemen Produk" />
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Daftar Produk</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari produk..."
              className="pl-8 w-48 sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Semua
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini akan menghapus SEMUA produk dari database Anda secara permanen. Aksi ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingAll}>Batal</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeletingAll}
                  onClick={handleDeleteAllProducts}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeletingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Ya, Hapus Semua
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <ProductImportDialog>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Impor Produk
            </Button>
          </ProductImportDialog>
          <ProductFormDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </ProductFormDialog>
        </div>
      </div>
      <div className="mt-4">
        <DataTable columns={columns} data={filteredProducts} actions={productActions} />
      </div>
    </>
  );
}
