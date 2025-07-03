import { Header } from "@/components/shared/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { DollarSign, Users, CreditCard, Activity } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import type { Sale } from "@/types";

async function getDashboardData() {
  const salesCol = collection(db, 'sales');
  const customersCol = collection(db, 'customers');

  const salesSnapshot = await getDocs(salesCol);
  const totalRevenue = salesSnapshot.docs.reduce((acc, doc) => acc + doc.data().total, 0);
  const totalSales = salesSnapshot.size;

  const customersSnapshot = await getDocs(customersCol);
  const totalCustomers = customersSnapshot.size;

  const recentSalesQuery = query(collection(db, 'sales'), orderBy('date', 'desc'), limit(5));
  const recentSalesSnapshot = await getDocs(recentSalesQuery);
  const recentSales = recentSalesSnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
      id: doc.id, 
      ...data,
      date: data.date.toDate().toISOString(),
    } as Sale
  });

  return { totalRevenue, totalCustomers, totalSales, recentSales };
}


export default async function DashboardPage() {
  const { totalRevenue, totalCustomers, totalSales, recentSales } = await getDashboardData();
  
  const chartData = [...recentSales].reverse().map(sale => ({
      name: new Date(sale.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      total: sale.total
  }));

  return (
    <>
      <Header title="Dasbor" />
      <div className="flex flex-col gap-4 mt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Pendapatan"
            value={`Rp${new Intl.NumberFormat('id-ID').format(totalRevenue)}`}
            icon={DollarSign}
          />
          <StatCard 
            title="Total Pelanggan"
            value={`+${totalCustomers}`}
            icon={Users}
          />
          <StatCard 
            title="Total Penjualan"
            value={`+${totalSales}`}
            icon={CreditCard}
          />
          <StatCard 
            title="Transaksi Terkini"
            value={`${recentSales.length}`}
            icon={Activity}
            description="5 transaksi terakhir"
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
