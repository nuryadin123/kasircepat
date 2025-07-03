import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns } from '@/components/reports/columns';
import { mockSales } from '@/lib/data';

export default function ReportsPage() {
  return (
    <>
      <Header title="Laporan Penjualan" />
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Riwayat Penjualan</h2>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Ekspor Laporan
        </Button>
      </div>
      <div className="mt-4">
        <DataTable columns={columns} data={mockSales} />
      </div>
    </>
  );
}
