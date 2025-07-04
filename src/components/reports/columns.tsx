'use client';

import { useState, useEffect } from 'react';
import { Sale } from '@/types';
import { Badge } from '@/components/ui/badge';
import { SaleActions } from './sale-actions';
import { SaleDetailDialog } from './sale-detail-dialog';

// Client component to safely render dates and avoid hydration errors.
const SafeDateCell = ({ isoDate }: { isoDate: string }) => {
  const [formatted, setFormatted] = useState<{ date: string; time: string } | null>(null);

  useEffect(() => {
    // This code runs only on the client, after the initial render.
    const d = new Date(isoDate);
    const date = d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const time = d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setFormatted({ date, time });
  }, [isoDate]);

  // On the server, and during the initial client render, we show a placeholder.
  if (!formatted) {
    return <span>Memuat...</span>;
  }

  // After mounting, we can safely show the client-rendered date.
  return (
    <div>
      <span>{formatted.date}</span>
      <span className="block text-muted-foreground">{formatted.time}</span>
    </div>
  );
};


export const columns = [
  {
    accessorKey: 'transactionId',
    header: 'No. Transaksi',
    cell: (row: Sale) => row.transactionId || row.id.substring(0, 7).toUpperCase(),
  },
  {
    accessorKey: 'date',
    header: 'Tanggal',
    cell: (row: Sale) => <SafeDateCell isoDate={row.date} />,
  },
  {
    accessorKey: 'items',
    header: 'Jumlah Item',
    cell: (row: Sale) => (
      <SaleDetailDialog sale={row}>
        <Badge variant="secondary" className="cursor-pointer font-normal">
          {`${row.items.reduce((sum, item) => sum + item.quantity, 0)} item`}
        </Badge>
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
