'use client';

import { mockProducts } from '@/lib/data';
import { Product } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';

interface ProductSelectorProps {
  onProductSelect: (product: Product) => void;
}

export function ProductSelector({ onProductSelect }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = mockProducts.filter((product) =>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="p-0">
                 <Image
                    data-ai-hint="food drink"
                    alt={product.name}
                    className="aspect-video w-full object-cover"
                    height="120"
                    src={`https://placehold.co/250x150.png`}
                    width="250"
                    />
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">Stok: {product.stock}</p>
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
      </ScrollArea>
    </div>
  );
}
