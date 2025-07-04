'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/shared/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const STORE_NAME_KEY = 'storeName';
const STORE_ADDRESS_KEY = 'storeAddress';

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from localStorage
    const savedStoreName = localStorage.getItem(STORE_NAME_KEY) || 'Kasiran App';
    const savedStoreAddress = localStorage.getItem(STORE_ADDRESS_KEY) || '';
    setStoreName(savedStoreName);
    setStoreAddress(savedStoreAddress);
    setIsLoading(false);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    // Save settings to localStorage
    localStorage.setItem(STORE_NAME_KEY, storeName);
    localStorage.setItem(STORE_ADDRESS_KEY, storeAddress);
    
    // Dispatch a custom event to notify other components of the change
    window.dispatchEvent(new Event('settings_updated'));
    
    setTimeout(() => { // Simulate network delay
        setIsSaving(false);
        toast({
            title: 'Sukses',
            description: 'Pengaturan berhasil disimpan.',
        });
    }, 500);
  };
  
  if (isLoading) {
      return (
           <>
              <Header title="Pengaturan" />
              <div className="flex items-center justify-center mt-10">
                  <Loader2 className="h-8 w-8 animate-spin" />
              </div>
           </>
      )
  }

  return (
    <>
      <Header title="Pengaturan" />
      <div className="flex flex-col gap-8 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Profil Toko</CardTitle>
            <CardDescription>
              Informasi dasar mengenai toko atau bisnis Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Nama Toko</Label>
              <Input 
                id="store-name" 
                placeholder="Masukkan nama toko" 
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address">Alamat Toko</Label>
              <Input 
                id="store-address" 
                placeholder="Masukkan alamat toko" 
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tampilan</CardTitle>
            <CardDescription>
              Atur tema tampilan aplikasi.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
             <Label>Mode Gelap/Terang</Label>
             <ThemeToggle />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
