import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Sale } from "@/types"

interface RecentSalesProps {
  sales: Sale[];
}

export function RecentSales({ sales = [] }: RecentSalesProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="font-headline">Penjualan Terkini</CardTitle>
        <CardDescription>
          Menampilkan {sales.length} transaksi terakhir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sales.length > 0 ? (
          <div className="space-y-8">
            {sales.map(sale => (
              <div className="flex items-center" key={sale.id}>
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {sale.items[0]?.name.substring(0,2).toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{sale.items.map(i => i.name).join(', ')}</p>
                  <p className="text-sm text-muted-foreground">
                    {sale.customer?.name || 'Pelanggan Umum'}
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  +Rp{new Intl.NumberFormat('id-ID').format(sale.total)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Belum ada penjualan.</p>
        )}
      </CardContent>
    </Card>
  )
}
