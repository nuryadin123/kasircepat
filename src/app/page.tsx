'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Set a default user role to bypass login for development
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', 'admin');
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Mengarahkan ke dasbor...</p>
      </div>
    </div>
  );
}
