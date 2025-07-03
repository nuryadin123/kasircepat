import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns, customerActions } from '@/components/customers/columns';
import { mockCustomers } from '@/lib/data';

export default function CustomersPage() {
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
        <DataTable columns={columns} data={mockCustomers} actions={customerActions} />
      </div>
    </>
  );
}
