'use client';

import { Sale } from '@/types';
import { Badge } from '@/components/ui/badge';
import { SaleActions } from './sale-actions';
import { SaleDetailDialog } from './sale-detail-dialog';

export const columns = [
  {
    accessorKey: 'transactionId',
    header: 'No. Transaksi',
    cell: (row: Sale) => row.transactionId || row.id.substring(0, 7).toUpperCase(),
  },
  {
    accessorKey: 'date',
    header: 'Tanggal',
    cell: (row: Sale) => {
      const d = new Date(row.date);
      const date = d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const time = d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return (
        <div>
          <span>{date}</span>
          <span className="block text-muted-foreground">{time}</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'customer',
    header: 'Pelanggan',
    cell: (row: Sale) => row.customer?.name || 'Pelanggan Umum',
  },
  {
    accessorKey: 'items',
    header: 'Jumlah Item',
    cell: (row: Sale) => (
      <SaleDetailDialog sale={row}>
        <button className="underline underline-offset-4 decoration-dashed hover:decoration-solid hover:text-primary transition-colors">
          {`${row.items.reduce((sum, item) => sum + item.quantity, 0)} item`}
        </button>
      </SaleDetailDialog>
    ),
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: (row: Sale) => `Rp${new Intl.NumberFormat('id-ID').format(row.total)}`,
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Pembayaran',
    cell: (row: Sale) => <Badge variant={row.paymentMethod === 'Card' ? 'default' : 'secondary'}>{row.paymentMethod}</Badge>,
  },
];

export const saleActions = (row: Sale) => (
  <SaleActions sale={row} />
);