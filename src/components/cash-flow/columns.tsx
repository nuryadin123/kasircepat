'use client';

import { CashFlowEntry } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CashFlowActions } from './cash-flow-actions';

export const columns = [
  {
    accessorKey: 'date',
    header: 'Tanggal',
    cell: (row: CashFlowEntry) => {
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
    accessorKey: 'type',
    header: 'Tipe',
    cell: (row: CashFlowEntry) => (
      <Badge
        variant="outline"
        className={cn(
          row.type === 'Pemasukan' && 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
          row.type === 'Pengeluaran' && 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'
        )}
      >
        {row.type}
      </Badge>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Deskripsi',
    cell: (row: CashFlowEntry) => (
      <div>
        <p className="font-medium">{row.description}</p>
        <p className="text-sm text-muted-foreground">{row.category}</p>
      </div>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Jumlah',
    cell: (row: CashFlowEntry) => {
      const isIncome = row.type === 'Pemasukan';
      return (
        <span className={cn(
          'font-medium',
          isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}>
          {isIncome ? '+' : '-'}Rp{new Intl.NumberFormat('id-ID').format(row.amount)}
        </span>
      );
    }
  },
];

export const cashFlowTableActions = (row: CashFlowEntry) => {
  if (row.category === 'Penjualan') {
    return null;
  }
  return <CashFlowActions entry={row} />;
};
