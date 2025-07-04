'use client';

import { Product } from '@/types';
import { ProductActions } from './product-actions';

export const columns = [
  {
    accessorKey: 'no',
    header: 'No.',
    cell: (row: Product, index: number) => index + 1,
  },
  {
    accessorKey: 'name',
    header: 'Nama Produk',
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
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
];

export const productActions = (row: Product) => (
    <ProductActions product={row} />
);
