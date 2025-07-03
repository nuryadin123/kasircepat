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
import type { Customer } from '@/types';
import { Loader2 } from 'lucide-react';

const customerFormSchema = z.object({
  name: z.string().min(1, { message: 'Nama pelanggan tidak boleh kosong.' }),
  email: z.string().email({ message: 'Format email tidak valid.' }),
  phone: z.string().min(1, { message: 'Nomor telepon tidak boleh kosong.' }),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormDialogProps {
  customer?: Customer;
  children: React.ReactNode;
}

export function CustomerFormDialog({ customer, children }: CustomerFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customer ? {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    } : {
      name: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      if (customer) {
        // Update existing customer
        const customerRef = doc(db, 'customers', customer.id);
        await updateDoc(customerRef, data);
        toast({ title: 'Sukses', description: 'Pelanggan berhasil diperbarui.' });
      } else {
        // Add new customer
        await addDoc(collection(db, 'customers'), {
          ...data,
          joinedDate: new Date().toISOString(),
          totalSpent: 0,
        });
        toast({ title: 'Sukses', description: 'Pelanggan berhasil ditambahkan.' });
      }
      form.reset();
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pelanggan. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</DialogTitle>
          <DialogDescription>
            {customer ? 'Ubah detail pelanggan di bawah ini.' : 'Isi formulir untuk menambahkan pelanggan baru.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Pelanggan</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. Budi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="cth. budi@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telepon</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. 08123456789" {...field} />
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
