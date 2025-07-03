'use client';

import { Product } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ProductActions } from './product-actions';

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
    cell: (row: Product) => new Date(row.createdAt as string).toLocaleDateString('id-ID'),
  },
];

export const productActions = (row: Product) => (
    <ProductActions product={row} />
);
