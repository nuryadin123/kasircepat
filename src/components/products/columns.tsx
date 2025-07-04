'use client';

import { Product } from '@/types';
import { ProductActions } from './product-actions';

export const columns = [
  {
    accessorKey: 'name',
    header: 'Nama Produk',
  },
  {
    accessorKey: 'price',
    header: 'Harga Jual',
    cell: (row: Product) => `Rp${new Intl.NumberFormat('id-ID').format(row.price)}`,
  },
  {
    accessorKey: 'cost',
    header: 'Harga Modal',
    cell: (row: Product) => `Rp${new Intl.NumberFormat('id-ID').format(row.cost)}`,
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
