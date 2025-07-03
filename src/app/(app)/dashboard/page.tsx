import { Header } from "@/components/shared/header"
import { StatCard } from "@/components/dashboard/stat-card"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { DollarSign, Users, CreditCard, Activity } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      <Header title="Dasbor" />
      <div className="flex flex-col gap-4 mt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Pendapatan"
            value="Rp45.231.890"
            icon={DollarSign}
            description="+20.1% dari bulan lalu"
          />
          <StatCard 
            title="Total Pelanggan"
            value="+2.350"
            icon={Users}
            description="+180.1% dari bulan lalu"
          />
          <StatCard 
            title="Total Penjualan"
            value="+12.234"
            icon={CreditCard}
            description="+19% dari bulan lalu"
          />
          <StatCard 
            title="Transaksi Aktif"
            value="+573"
            icon={Activity}
            description="+201 sejak jam terakhir"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <SalesChart />
          <RecentSales />
        </div>
      </div>
    </>
  )
}
