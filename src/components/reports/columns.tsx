'use client';

import { Sale } from '@/types';
import { Badge } from '@/components/ui/badge';

export const columns = [
  {
    accessorKey: 'id',
    header: 'ID Penjualan',
  },
  {
    accessorKey: 'date',
    header: 'Tanggal',
    cell: (row: Sale) => new Date(row.date).toLocaleString('id-ID'),
  },
  {
    accessorKey: 'items',
    header: 'Item',
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
