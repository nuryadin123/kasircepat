import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns, customerActions } from '@/components/customers/columns';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Customer } from '@/types';

async function getCustomers(): Promise<Customer[]> {
  const customersCol = collection(db, 'customers');
  const customerSnapshot = await getDocs(customersCol);
  const customerList = customerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
  return customerList;
}

export default async function CustomersPage() {
  const customers = await getCustomers();
  return (
    <>
      <Header title="Manajemen Pelanggan" />
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Daftar Pelanggan</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Pelanggan
        </Button>
      </div>
      <div className="mt-4">
        <DataTable columns={columns} data={customers} actions={customerActions} />
      </div>
    </>
  );
}
