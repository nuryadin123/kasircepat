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
import { Loader2, Sparkles } from 'lucide-react';
import { suggestExpenses } from '@/ai/flows/suggest-expense-flow';

const formSchema = z.object({
  description: z.string().min(1, { message: 'Deskripsi tidak boleh kosong.' }),
  amount: z.coerce.number().positive({ message: 'Jumlah harus lebih dari 0.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface CashFlowFormDialogProps {
  entry?: CashFlowEntry;
  type: 'Pemasukan' | 'Pengeluaran';
  children: React.ReactNode;
  expenseDescriptions?: string[];
}

export function CashFlowFormDialog({ entry, type, children, expenseDescriptions = [] }: CashFlowFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: entry ? {
      description: entry.description,
      amount: entry.amount,
    } : {
      description: '',
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

  const handleGetSuggestions = async () => {
    setIsSuggesting(true);
    setSuggestions([]);
    try {
      const result = await suggestExpenses({
        existingExpenses: expenseDescriptions,
        query: form.getValues('description'),
      });
      if (result.suggestions) {
        setSuggestions(result.suggestions);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        title: 'Gagal Mendapatkan Saran',
        description: 'Terjadi kesalahan saat berkomunikasi dengan AI.',
        variant: 'destructive',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    form.setValue('description', suggestion, { shouldValidate: true });
    setSuggestions([]);
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
                   <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder={type === 'Pemasukan' ? 'cth. Modal Awal' : 'cth. Beli Bahan Baku'} {...field} />
                    </FormControl>
                    {type === 'Pengeluaran' && (
                        <Button type="button" variant="outline" size="icon" onClick={handleGetSuggestions} disabled={isSuggesting}>
                            {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            <span className="sr-only">Dapatkan Saran</span>
                        </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {suggestions.length > 0 && (
              <div className="p-2 border rounded-md bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Saran deskripsi:</p>
                  <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                          <Button 
                              key={index} 
                              type="button" 
                              variant="secondary" 
                              size="sm" 
                              className="text-xs h-auto py-1 px-2"
                              onClick={() => handleSuggestionClick(suggestion)}
                          >
                              {suggestion}
                          </Button>
                      ))}
                  </div>
              </div>
            )}
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
