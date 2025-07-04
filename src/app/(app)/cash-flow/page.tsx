'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/header';
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
import { ArrowDownLeft, ArrowUpRight, PlusCircle, Scale, Loader2, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, writeBatch, doc } from 'firebase/firestore';
import type { CashFlowEntry } from '@/types';
import { StatCard } from '@/components/dashboard/stat-card';
import { CashFlowFormDialog } from '@/components/cash-flow/cash-flow-form-dialog';
import { CashFlowTable } from '@/components/cash-flow/cash-flow-table';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function CashFlowPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<{
    entries: CashFlowEntry[];
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
    expenseDescriptions: string[];
  } | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    async function getCashFlowData() {
      try {
        const salesCol = query(collection(db, 'sales'), orderBy('date', 'desc'));
        const cashFlowCol = query(collection(db, 'cash-flow'), orderBy('date', 'desc'));

        const [salesSnapshot, cashFlowSnapshot] = await Promise.all([
          getDocs(salesCol),
          getDocs(cashFlowCol),
        ]);

        const salesEntries: CashFlowEntry[] = salesSnapshot.docs.map(doc => {
          const data = doc.data();
          const date = (data.date as any).toDate().toISOString();
          return {
            id: doc.id,
            date: date,
            type: 'Pemasukan',
            description: `Penjualan ${data.transactionId || doc.id.substring(0, 6).toUpperCase()}`,
            amount: data.total,
          } as CashFlowEntry;
        });

        const manualEntries = cashFlowSnapshot.docs.map(doc => {
          const data = doc.data();
          const date = typeof data.date === 'string' ? data.date : (data.date as any).toDate().toISOString();
          return { ...data, id: doc.id, date } as CashFlowEntry;
        });

        const allEntries = [...salesEntries, ...manualEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const totalIncome = allEntries
          .filter(e => e.type === 'Pemasukan')
          .reduce((acc, e) => acc + e.amount, 0);

        const totalExpense = allEntries
          .filter(e => e.type === 'Pengeluaran')
          .reduce((acc, e) => acc + e.amount, 0);

        const netCashFlow = totalIncome - totalExpense;

        const expenseDescriptions = manualEntries
          .filter(e => e.type === 'Pengeluaran')
          .map(e => e.description);

        setData({ entries: allEntries, totalIncome, totalExpense, netCashFlow, expenseDescriptions });
      } catch (error) {
        console.error("Failed to fetch cash flow data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getCashFlowData();
  }, [router]);
  
  const handleDeleteAllEntries = async () => {
    setIsDeletingAll(true);
    try {
      const cashFlowCol = collection(db, 'cash-flow');
      const salesCol = collection(db, 'sales');

      const [cashFlowSnapshot, salesSnapshot] = await Promise.all([
          getDocs(cashFlowCol),
          getDocs(salesCol),
      ]);
      
      if (cashFlowSnapshot.empty && salesSnapshot.empty) {
        toast({ title: 'Tidak Ada Data', description: 'Tidak ada riwayat penjualan atau arus kas untuk dihapus.' });
        setIsDeletingAll(false);
        return;
      }

      const batch = writeBatch(db);
      
      cashFlowSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      salesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Also reset the sales counter
      const counterRef = doc(db, 'counters', 'sales');
      batch.set(counterRef, { lastNumber: 0 });

      await batch.commit();

      toast({ title: 'Sukses', description: 'Semua riwayat penjualan dan data arus kas berhasil dihapus.' });
      router.refresh();
    } catch (error) {
      console.error("Failed to delete all sales and cash flow entries:", error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus semua riwayat penjualan dan arus kas.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  if (isLoading || !data) {
    return (
      <>
        <Header title="Arus Kas" />
        <div className="flex items-center justify-center mt-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  const { entries, totalIncome, totalExpense, netCashFlow, expenseDescriptions } = data;
  const displayedEntries = userRole === 'admin' 
    ? entries 
    : entries.filter(e => e.type === 'Pengeluaran' && !e.description.startsWith('Biaya Pokok Penjualan'));

  return (
    <>
      <Header title="Arus Kas" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Laporan Arus Kas</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          {userRole === 'admin' && (
            <CashFlowFormDialog type="Pemasukan">
              <Button className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Pemasukan
              </Button>
            </CashFlowFormDialog>
          )}
          <CashFlowFormDialog type="Pengeluaran" expenseDescriptions={expenseDescriptions}>
            <Button variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Pengeluaran
            </Button>
          </CashFlowFormDialog>
           {userRole === 'admin' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Semua
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan menghapus SEMUA riwayat penjualan dan data arus kas (termasuk yang dibuat otomatis). Aksi ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeletingAll}>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isDeletingAll}
                    onClick={handleDeleteAllEntries}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeletingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Ya, Hapus Semua
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      <div className={cn("grid gap-4 mt-4", userRole === 'admin' && 'md:grid-cols-3')}>
        {userRole === 'admin' && (
          <StatCard
            title="Total Pemasukan"
            value={`Rp${new Intl.NumberFormat('id-ID').format(totalIncome)}`}
            icon={ArrowUpRight}
            className="border-green-500"
          />
        )}
        <StatCard
          title="Total Pengeluaran"
          value={`Rp${new Intl.NumberFormat('id-ID').format(totalExpense)}`}
          icon={ArrowDownLeft}
          className="border-red-500"
        />
        {userRole === 'admin' && (
          <StatCard
            title="Arus Kas Bersih"
            value={`Rp${new Intl.NumberFormat('id-ID').format(netCashFlow)}`}
            icon={Scale}
            className={netCashFlow >= 0 ? "border-blue-500" : "border-yellow-500"}
          />
        )}
      </div>
      <div className="mt-4">
        <CashFlowTable data={displayedEntries} expenseDescriptions={expenseDescriptions} userRole={userRole} />
      </div>
    </>
  );
}
