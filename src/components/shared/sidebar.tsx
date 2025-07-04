'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart2,
  Settings,
  Calculator,
  Landmark,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dasbor', roles: ['admin'] },
  { href: '/sales', icon: ShoppingCart, label: 'Penjualan', roles: ['admin', 'cashier'] },
  { href: '/products', icon: Package, label: 'Produk', roles: ['admin'] },
  { href: '/reports', icon: BarChart2, label: 'Laporan', roles: ['admin'] },
  { href: '/cash-flow', icon: Landmark, label: 'Arus Kas', roles: ['admin', 'cashier'] },
];

const STORE_NAME_KEY = 'storeName';

export function Sidebar() {
  const pathname = usePathname();
  const [storeName, setStoreName] = useState('Kasiran');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    
    const updateStoreName = () => {
      const savedStoreName = localStorage.getItem(STORE_NAME_KEY);
      if (savedStoreName) {
        setStoreName(savedStoreName);
      }
    };
    
    updateStoreName();
    window.addEventListener('settings_updated', updateStoreName);
    
    return () => {
      window.removeEventListener('settings_updated', updateStoreName);
    };
  }, []);

  const visibleNavItems = navItems.filter(item => userRole && item.roles.includes(userRole));

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex print:hidden">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Calculator className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">{storeName}</span>
        </Link>
        <TooltipProvider>
          {visibleNavItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                    pathname === item.href && 'bg-accent text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
      {userRole === 'admin' && (
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings"
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                    pathname === '/settings' && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Pengaturan</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Pengaturan</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      )}
    </aside>
  );
}
