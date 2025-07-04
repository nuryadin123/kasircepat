'use client';

import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface ProductSelectorProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

export function ProductSelector({ products, onProductSelect }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari produk..."
          className="w-full pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-grow pr-4 -mr-4">
        {products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden flex flex-col">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-4 flex-grow">
                   <Skeleton className="h-4 w-3/4 mb-2" />
                   <Skeleton className="h-4 w-1/2" />
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-4 flex-grow">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className={cn(
                    "text-sm text-muted-foreground",
                    product.stock <= 0 && "text-destructive"
                  )}>
                    Stok: {product.stock > 0 ? product.stock : 'Habis'}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => onProductSelect(product)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
