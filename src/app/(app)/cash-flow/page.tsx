import { Header } from '@/components/shared/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CashFlowPage() {
  return (
    <>
      <Header title="Arus Kas" />
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Laporan Arus Kas</h2>
      </div>
      <div className="mt-4">
        <Card>
            <CardHeader>
                <CardTitle>Dalam Pengembangan</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Fitur laporan arus kas sedang dalam pengembangan dan akan segera tersedia.</p>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
