'use client';

import { Product } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

export const columns = [
  {
    accessorKey: 'name',
    header: 'Nama Produk',
  },
  {
    accessorKey: 'category',
    header: 'Kategori',
    cell: (row: Product) => <Badge variant="outline">{row.category}</Badge>,
  },
  {
    accessorKey: 'price',
    header: 'Harga',
    cell: (row: Product) => `Rp${new Intl.NumberFormat('id-ID').format(row.price)}`,
  },
  {
    accessorKey: 'stock',
    header: 'Stok',
  },
  {
    accessorKey: 'createdAt',
    header: 'Tanggal Dibuat',
  },
];

export const productActions = (row: Product) => (
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
