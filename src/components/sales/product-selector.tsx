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
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductSelectorProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

export function ProductSelector({ products, onProductSelect }: ProductSelectorProps) {
  const [selectedProductId, setSelectedProductId] = React.useState<string | undefined>(undefined);

  const handleAdd = () => {
    if (!selectedProductId) return;
    const product = products.find((p) => p.id === selectedProductId);
    if (product) {
      onProductSelect(product);
    }
    // Reset selection after adding
    setSelectedProductId(undefined);
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline text-lg">Tambah Item</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-2">
                <Select onValueChange={setSelectedProductId} value={selectedProductId}>
                    <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Pilih produk..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                                {`${product.name} - Rp${new Intl.NumberFormat('id-ID').format(product.price)}`}
                            </SelectItem>
                        ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Button onClick={handleAdd} disabled={!selectedProductId}> 
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}
