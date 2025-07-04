import { Header } from "@/components/shared/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { DollarSign, ArrowDownLeft, Scale } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import type { Sale } from "@/types";

async function getDashboardData() {
  const salesQuery = query(collection(db, 'sales'), orderBy('date', 'desc'));
  const cashFlowCol = collection(db, 'cash-flow');

  const [salesSnapshot, cashFlowSnapshot] = await Promise.all([
    getDocs(salesQuery),
    getDocs(cashFlowCol)
  ]);

  const allSalesDocs = salesSnapshot.docs;
  
  const recentSales = allSalesDocs.slice(0, 5).map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        date: data.date.toDate().toISOString(),
      } as Sale
  });
  
  // Cash Flow stats
  const salesAsIncomeEntries = allSalesDocs.map(doc => ({
      type: 'Pemasukan' as const,
      amount: doc.data().total as number
  }));

  const manualCashFlowEntries = cashFlowSnapshot.docs.map(doc => ({
      type: doc.data().type as 'Pemasukan' | 'Pengeluaran',
      amount: doc.data().amount as number
  }));

  const allEntries = [...salesAsIncomeEntries, ...manualCashFlowEntries];

  const totalIncome = allEntries
    .filter(e => e.type === 'Pemasukan')
    .reduce((acc, e) => acc + e.amount, 0);
  
  const totalExpense = allEntries
    .filter(e => e.type === 'Pengeluaran')
    .reduce((acc, e) => acc + e.amount, 0);

  const netCashFlow = totalIncome - totalExpense;

  return { totalRevenue: totalIncome, totalExpense, netCashFlow, recentSales };
}


export default async function DashboardPage() {
  const { totalRevenue, totalExpense, netCashFlow, recentSales } = await getDashboardData();
  
  const chartData = [...recentSales].reverse().map(sale => ({
      name: new Date(sale.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      total: sale.total
  }));

  return (
    <>
      <Header title="Dasbor" />
      <div className="flex flex-col gap-4 mt-4">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard 
            title="Total Pendapatan"
            value={`Rp${new Intl.NumberFormat('id-ID').format(totalRevenue)}`}
            icon={DollarSign}
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <SalesChart data={chartData} />
          <RecentSales sales={recentSales} />
        </div>
      </div>
    </>
  )
}
