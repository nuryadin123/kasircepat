import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { ArrowDownLeft, ArrowUpRight, PlusCircle, Scale } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns, cashFlowTableActions } from '@/components/cash-flow/columns';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { Sale, CashFlowEntry } from '@/types';
import { StatCard } from '@/components/dashboard/stat-card';
import { CashFlowFormDialog } from '@/components/cash-flow/cash-flow-form-dialog';

async function getCashFlowData(): Promise<{
    entries: CashFlowEntry[],
    totalIncome: number,
    totalExpense: number,
    netCashFlow: number,
    expenseDescriptions: string[]
}> {
  const salesCol = query(collection(db, 'sales'), orderBy('date', 'desc'));
  const cashFlowCol = query(collection(db, 'cash-flow'), orderBy('date', 'desc'));

  const [salesSnapshot, cashFlowSnapshot] = await Promise.all([
      getDocs(salesCol),
      getDocs(cashFlowCol),
  ]);

  const salesEntries: CashFlowEntry[] = salesSnapshot.docs.map(doc => {
    const data = doc.data();
    // The data.date from firestore is a Timestamp object. It needs to be converted to a string.
    const date = (data.date as any).toDate().toISOString(); 
    return { 
      id: doc.id,
      date: date,
      type: 'Pemasukan',
      description: `Penjualan ${data.transactionId || doc.id.substring(0,6).toUpperCase()}`,
      amount: data.total,
    } as CashFlowEntry;
  });

  const manualEntries = cashFlowSnapshot.docs.map(doc => {
    const data = doc.data();
    // Handle potential timestamp conversion for manually added entries too
    const date = typeof data.date === 'string' ? data.date : (data.date as any).toDate().toISOString();
    return { ...data, id: doc.id, date } as CashFlowEntry
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

  return { entries: allEntries, totalIncome, totalExpense, netCashFlow, expenseDescriptions };
}


export default async function CashFlowPage() {
  const { entries, totalIncome, totalExpense, netCashFlow, expenseDescriptions } = await getCashFlowData();

  return (
    <>
      <Header title="Arus Kas" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Laporan Arus Kas</h2>
        <div className="flex gap-2 w-full sm:w-auto">
            <CashFlowFormDialog type="Pemasukan">
                <Button className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Pemasukan
                </Button>
            </CashFlowFormDialog>
            <CashFlowFormDialog type="Pengeluaran" expenseDescriptions={expenseDescriptions}>
                <Button variant="outline" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Pengeluaran
                </Button>
            </CashFlowFormDialog>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3 mt-4">
          <StatCard 
            title="Total Pemasukan"
            value={`Rp${new Intl.NumberFormat('id-ID').format(totalIncome)}`}
            icon={ArrowUpRight}
            className="border-green-500"
          />
          <StatCard 
            title="Total Pengeluaran"
            value={`Rp${new Intl.NumberFormat('id-ID').format(totalExpense)}`}
            icon={ArrowDownLeft}
            className="border-red-500"
          />
          <StatCard 
            title="Arus Kas Bersih"
            value={`Rp${new Intl.NumberFormat('id-ID').format(netCashFlow)}`}
            icon={Scale}
            className={netCashFlow >= 0 ? "border-blue-500" : "border-yellow-500"}
          />
      </div>
      <div className="mt-4">
        <DataTable columns={columns} data={entries} actions={cashFlowTableActions(expenseDescriptions)} />
      </div>
    </>
  );
}
