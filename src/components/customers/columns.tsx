'use client';

import { Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const columns = [
  {
    accessorKey: 'name',
    header: 'Nama Pelanggan',
    cell: (row: Customer) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
            <AvatarImage data-ai-hint="person avatar" src={`https://i.pravatar.cc/150?u=${row.email}`} alt={row.name} />
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
  },
];

export const customerActions = (row: Customer) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Pencil className="mr-2 h-4 w-4"/>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4"/>
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
);
