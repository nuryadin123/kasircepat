'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
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
import type { CashFlowEntry } from '@/types';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  description: z.string().min(1, { message: 'Deskripsi tidak boleh kosong.' }),
  category: z.string().min(1, { message: 'Kategori tidak boleh kosong.' }),
  amount: z.coerce.number().positive({ message: 'Jumlah harus lebih dari 0.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface CashFlowFormDialogProps {
  entry?: CashFlowEntry;
  type: 'Pemasukan' | 'Pengeluaran';
  children: React.ReactNode;
}

export function CashFlowFormDialog({ entry, type, children }: CashFlowFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: entry ? {
      description: entry.description,
      category: entry.category,
      amount: entry.amount,
    } : {
      description: '',
      category: '',
      amount: 0,
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const entryData = { ...data, type, date: new Date().toISOString() };
      if (entry) {
        const entryRef = doc(db, 'cash-flow', entry.id);
        await updateDoc(entryRef, entryData);
        toast({ title: 'Sukses', description: `Data ${type} berhasil diperbarui.` });
      } else {
        await addDoc(collection(db, 'cash-flow'), entryData);
        toast({ title: 'Sukses', description: `Data ${type} berhasil ditambahkan.` });
      }
      form.reset();
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(`Error saving cash flow entry:`, error);
      toast({
        title: 'Error',
        description: `Gagal menyimpan data ${type}.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = entry ? `Edit ${type}` : `Tambah ${type}`;
  const description = entry ? 'Ubah detail di bawah ini.' : `Isi formulir untuk menambahkan ${type} baru.`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Input placeholder={type === 'Pemasukan' ? 'cth. Modal Awal' : 'cth. Beli Bahan Baku'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <FormControl>
                    <Input placeholder={type === 'Pemasukan' ? 'cth. Operasional' : 'cth. Biaya Pokok'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="cth. 500000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
