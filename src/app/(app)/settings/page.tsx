import { Header } from '@/components/shared/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export default function SettingsPage() {
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
              <Input id="store-name" placeholder="Masukkan nama toko" defaultValue="Kasiran App" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address">Alamat Toko</Label>
              <Input id="store-address" placeholder="Masukkan alamat toko" />
            </div>
            <Button>Simpan Perubahan</Button>
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
