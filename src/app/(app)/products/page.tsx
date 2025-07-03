import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns, productActions } from '@/components/products/columns';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Product } from '@/types';

async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const productSnapshot = await getDocs(productsCol);
  const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  return productList;
}

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <>
      <Header title="Manajemen Produk" />
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Daftar Produk</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>
      <div className="mt-4">
        <DataTable columns={columns} data={products} actions={productActions} />
      </div>
    </>
  );
}
