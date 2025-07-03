import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { mockSales } from "@/lib/data"

export function RecentSales() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="font-headline">Penjualan Terkini</CardTitle>
        <CardDescription>
          Anda melakukan {mockSales.length} penjualan hari ini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {mockSales.slice(0, 5).map(sale => (
            <div className="flex items-center" key={sale.id}>
              <Avatar className="h-9 w-9">
                <AvatarImage data-ai-hint="person avatar" src={`https://i.pravatar.cc/150?u=${sale.id}`} alt="Avatar" />
                <AvatarFallback>
                  {sale.items[0].name.substring(0,2).toUpperCase()}
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
      </CardContent>
    </Card>
  )
}
