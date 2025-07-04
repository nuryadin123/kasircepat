'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseAuthUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/types';

// Schema for login form
const authSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid.' }).trim(),
  password: z.string().min(6, { message: 'Password harus minimal 6 karakter.' }),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Check auth state on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, check role and redirect
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'admin') {
          router.replace('/dashboard');
        } else if (userRole === 'cashier') {
          router.replace('/sales');
        }
      }
      // If no user, stay on auth page
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSuccessfulLogin = (user: FirebaseAuthUser, userData: Omit<User, 'id'>) => {
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userName', userData.name as string);
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userUID', user.uid); // Store UID

    if (userData.role === 'admin') {
      router.replace('/dashboard');
    } else {
      router.replace('/sales');
    }
  };

  const handleAuth = async (data: AuthFormValues) => {
    setIsLoading(true);
    const { email, password } = data;

    try {
      // --- Login ---
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // 2. Fetch user data from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error('Data pengguna tidak ditemukan di database.');
      }

      const userData = userDoc.data() as Omit<User, 'id'>;
      handleSuccessfulLogin(user, userData);
      
    } catch (error: any) {
      console.error(`Login failed:`, error);
      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Email atau password salah.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: 'Gagal',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isCheckingAuth) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
             <div className="group flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-10 md:w-10 md:text-base">
              <Terminal className="h-5 w-5 transition-all group-hover:scale-110" />
            </div>
          </div>
          <CardTitle className="font-headline text-2xl">Selamat Datang</CardTitle>
          <CardDescription>Masuk untuk melanjutkan ke Kasiran.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAuth)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="nama@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Masuk
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
