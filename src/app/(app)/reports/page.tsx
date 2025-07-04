'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns, saleActions } from '@/components/reports/columns';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { Sale } from '@/types';


export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      router.replace('/sales');
      return;
    }

    async function getSales() {
      try {
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
        setSales(salesList);
      } catch (error) {
        console.error("Failed to fetch sales reports:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getSales();
  }, [router]);

  if (isLoading) {
    return (
      <>
        <Header title="Laporan Penjualan" />
        <div className="flex items-center justify-center mt-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

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
        <DataTable columns={columns} data={sales} actions={saleActions} />
      </div>
    </>
  );
}
