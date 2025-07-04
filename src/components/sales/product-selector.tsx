'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductSelectorProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

export function ProductSelector({ products, onProductSelect }: ProductSelectorProps) {
  // A key is used to reset the Select component after a selection is made
  const [selectKey, setSelectKey] = React.useState(Date.now());

  const handleProductSelect = (productId: string) => {
    if (!productId) return;
    const product = products.find((p) => p.id === productId);
    if (product) {
      onProductSelect(product);
    }
    // Reset the select component so the placeholder shows again,
    // allowing the same item to be selected consecutively.
    setSelectKey(Date.now());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Tambah Item</CardTitle>
      </CardHeader>
      <CardContent>
        <Select onValueChange={handleProductSelect} key={selectKey}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih produk untuk ditambahkan..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {`${product.name}${product.variant ? ` (${product.variant})` : ''} - Rp${new Intl.NumberFormat('id-ID').format(product.price)}`}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
