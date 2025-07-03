'use client';

import { useState, useEffect } from 'react';
import { CashFlowEntry } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CashFlowActions } from './cash-flow-actions';

// This is a new client component to safely render dates and avoid hydration errors.
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
    accessorKey: 'date',
    header: 'Tanggal',
    cell: (row: CashFlowEntry) => {
      return <SafeDateCell isoDate={row.date} />;
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
  if (row.category === 'Penjualan' || row.category === 'Biaya Pokok Penjualan') {
    return null;
  }
  return <CashFlowActions entry={row} />;
};
