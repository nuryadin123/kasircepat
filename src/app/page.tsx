'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal } from 'lucide-react';

export default function RoleSelectionPage() {
  const router = useRouter();

  const handleLogin = (role: 'admin' | 'cashier') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', role);
      if (role === 'admin') {
        router.replace('/dashboard');
      } else {
        router.replace('/sales');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
             <div
              className="group flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-10 md:w-10 md:text-base"
            >
              <Terminal className="h-5 w-5 transition-all group-hover:scale-110" />
            </div>
          </div>
          <CardTitle className="font-headline text-2xl">Selamat Datang di Kasiran</CardTitle>
          <CardDescription>Silakan masuk dengan memilih peran Anda.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button className="w-full" onClick={() => handleLogin('admin')}>
            Masuk sebagai Admin
          </Button>
          <Button variant="outline" className="w-full" onClick={() => handleLogin('cashier')}>
            Masuk sebagai Kasir
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
