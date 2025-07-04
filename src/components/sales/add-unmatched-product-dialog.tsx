'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Product, SaleItem } from '@/types';
import { Loader2, PlusCircle } from 'lucide-react';

const productFormSchema = z.object({
  name: z.string().min(1, { message: 'Nama produk tidak boleh kosong.' }),
  sku: z.string().optional(),
  price: z.coerce.number().min(0, { message: 'Harga harus positif.' }),
  cost: z.coerce.number().min(0, { message: 'Harga modal harus diisi dan positif.' }),
  stock: z.coerce.number().int({ message: 'Stok harus berupa angka bulat.' }).min(0, { message: 'Stok tidak boleh negatif.' }),
});

type ProductFormValues = z.infer<typeof productFormSchema>;
type CartItemWithId = SaleItem & { cartId: string };

interface AddUnmatchedProductDialogProps {
  item: CartItemWithId;
  onProductAdded: (newProduct: Product, cartId: string) => void;
}

export function AddUnmatchedProductDialog({ item, onProductAdded }: AddUnmatchedProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: item.name,
      sku: item.sku || '',
      price: item.price,
      cost: item.cost || 0, // Default to 0, user must fill
      stock: item.quantity, // Default stock to imported quantity
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const newProductData = {
        ...data,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'products'), newProductData);
      
      const newProduct: Product = {
        id: docRef.id,
        ...newProductData,
      };
      
      onProductAdded(newProduct, item.cartId);
      
      toast({ title: 'Sukses', description: 'Produk baru berhasil ditambahkan.' });
      
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan produk. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-auto py-1 px-2 text-xs">
          <PlusCircle className="mr-1 h-3 w-3" />
          Tambah Produk
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
          <DialogDescription>
            Produk ini tidak ditemukan. Lengkapi detailnya untuk menambahkannya ke database.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Produk</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. Kopi Susu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. KP-S-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga Jual</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="cth. 25000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga Modal</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="cth. 15000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stok Awal</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="cth. 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Produk
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
