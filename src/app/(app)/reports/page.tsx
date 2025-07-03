import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns } from '@/components/reports/columns';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { Sale } from '@/types';

async function getSales(): Promise<Sale[]> {
  const salesCol = query(collection(db, 'sales'), orderBy('date', 'desc'));
  const salesSnapshot = await getDocs(salesCol);
  const salesList = salesSnapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      date: data.date.toDate().toISOString(),
    } as Sale
  });
  return salesList;
}


export default async function ReportsPage() {
  const sales = await getSales();

  return (
    <>
      <Header title="Laporan Penjualan" />
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">Riwayat Penjualan</h2>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Ekspor Laporan
        </Button>
      </div>
      <div className="mt-4">
        <DataTable columns={columns} data={sales} />
      </div>
    </>
  );
}
