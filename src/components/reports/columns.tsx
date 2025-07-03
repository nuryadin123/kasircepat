'use client';

import { Sale } from '@/types';
import { Badge } from '@/components/ui/badge';
import { SaleActions } from './sale-actions';

export const columns = [
  {
    accessorKey: 'transactionId',
    header: 'No. Transaksi',
    cell: (row: Sale) => row.transactionId || row.id.substring(0, 7).toUpperCase(),
  },
  {
    accessorKey: 'date',
    header: 'Tanggal',
    cell: (row: Sale) => new Date(row.date).toLocaleString('id-ID'),
  },
  {
    accessorKey: 'customer',
    header: 'Pelanggan',
    cell: (row: Sale) => row.customer?.name || 'Pelanggan Umum',
  },
  {
    accessorKey: 'items',
    header: 'Jumlah Item',
    cell: (row: Sale) => `${row.items.reduce((sum, item) => sum + item.quantity, 0)} item`,
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
