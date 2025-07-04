'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft, Terminal, Settings } from 'lucide-react';
import { navItems } from './sidebar';
import { cn } from '@/lib/utils';

const STORE_NAME_KEY = 'storeName';

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [storeName, setStoreName] = useState('Kasiran');

  const updateStoreName = () => {
    const savedStoreName = localStorage.getItem(STORE_NAME_KEY);
    if (savedStoreName) {
      setStoreName(savedStoreName);
    }
  };

  useEffect(() => {
    updateStoreName();
    window.addEventListener('settings_updated', updateStoreName);
    return () => {
      window.removeEventListener('settings_updated', updateStoreName);
    };
  }, []);


  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Buka Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs flex flex-col">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className="group flex items-center gap-2 text-lg font-semibold"
          >
            <div
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <Terminal className="h-4 w-4 transition-all group-hover:scale-110" />
            </div>
            <span>{storeName}</span>
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                pathname === item.href && 'text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <nav className="mt-auto grid gap-6 text-lg font-medium">
            <Link
              href="/settings"
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                pathname === '/settings' && 'text-foreground'
              )}
            >
              <Settings className="h-5 w-5" />
              Pengaturan
            </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
