'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns, customerActions } from '@/components/customers/columns';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { Customer } from '@/types';
import { CustomerFormDialog } from '@/components/customers/customer-form-dialog';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      router.replace('/sales');
      return;
    }

    async function getCustomers() {
      try {
        const customersCol = query(collection(db, 'customers'), orderBy('name', 'asc'));
        const customerSnapshot = await getDocs(customersCol);
        const customerList = customerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
        setCustomers(customerList);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getCustomers();
  }, [router]);

  if (isLoading) {
    return (
      <>
        <Header title="Manajemen Pelanggan" />
        <div className="flex items-center justify-center mt-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }
  
  return (
    <>
      <Header title="Manajemen Pelanggan" />
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Daftar Pelanggan</h2>
        <CustomerFormDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Pelanggan
          </Button>
        </CustomerFormDialog>
      </div>
      <div className="mt-4">
        <DataTable columns={columns} data={customers} actions={customerActions} />
      </div>
    </>
  );
}
