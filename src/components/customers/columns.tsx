'use client';

import { Customer } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CustomerActions } from './customer-actions';


export const columns = [
  {
    accessorKey: 'name',
    header: 'Nama Pelanggan',
    cell: (row: Customer) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
            <AvatarFallback>{row.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span>{row.name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Telepon',
  },
  {
    accessorKey: 'totalSpent',
    header: 'Total Belanja',
    cell: (row: Customer) => `Rp${new Intl.NumberFormat('id-ID').format(row.totalSpent)}`,
  },
  {
    accessorKey: 'joinedDate',
    header: 'Tanggal Bergabung',
    cell: (row: Customer) => new Date(row.joinedDate as string).toLocaleDateString('id-ID'),
  },
];

export const customerActions = (row: Customer) => (
  <CustomerActions customer={row} />
);
