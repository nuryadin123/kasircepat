'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Upload, Search, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns, productActions } from '@/components/products/columns';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { Product } from '@/types';
import { ProductFormDialog } from '@/components/products/product-form-dialog';
import { ProductImportDialog } from '@/components/products/product-import-dialog';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
