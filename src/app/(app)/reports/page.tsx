'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns, saleActions } from '@/components/reports/columns';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { Sale } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      router.replace('/sales');
      return;
    }

    async function getSales() {
      try {
        const salesCol = query(collection(db, 'sales'), orderBy('date', 'desc'));
        const salesSnapshot = await getDocs(salesCol);
        const salesList = salesSnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            date: data.date.toDate().toISOString(),
          } as Sale
        });
        setSales(salesList);
      } catch (error) {
        console.error("Failed to fetch sales reports:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getSales();
  }, [router]);
  
  const handleExportPDF = () => {
    setIsExporting(true);
    try {
        const doc = new jsPDF();
        const storeName = localStorage.getItem('storeName') || 'Kasiran App';
        const generatedDate = new Date().toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text(storeName, 14, 22);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text('Laporan Penjualan', 14, 30);
        doc.setFontSize(10);
        doc.text(`Tanggal Dibuat: ${generatedDate}`, 14, 35);

        // Table
        (doc as any).autoTable({
            startY: 45,
            head: [['No. Transaksi', 'Tanggal', 'Jumlah Item', 'Total']],
            body: sales.map(sale => [
                sale.transactionId || sale.id.substring(0, 7).toUpperCase(),
                new Date(sale.date).toLocaleString('id-ID'),
                sale.items.reduce((sum, item) => sum + item.quantity, 0),
                `Rp${new Intl.NumberFormat('id-ID').format(sale.total)}`
            ]),
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            styles: { font: 'helvetica', fontSize: 9 },
            theme: 'striped',
            didDrawPage: (data: any) => {
                // Footer
                const pageCount = doc.getNumberOfPages();
                doc.setFontSize(8);
                doc.text(`Halaman ${data.pageNumber} dari ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        doc.save(`Laporan-Penjualan-${storeName.replace(/\s/g, '_')}.pdf`);
    } catch (error) {
        console.error("Failed to export PDF:", error);
        toast({
            title: "Gagal Mengekspor",
            description: "Terjadi kesalahan saat membuat file PDF.",
            variant: "destructive",
        });
    } finally {
        setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Laporan Penjualan" />
        <div className="flex items-center justify-center mt-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Laporan Penjualan" />
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">Riwayat Penjualan</h2>
        <Button variant="outline" onClick={handleExportPDF} disabled={isExporting || sales.length === 0}>
           {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isExporting ? 'Mengekspor...' : 'Ekspor Laporan'}
        </Button>
      </div>
      <div className="mt-4">
        <DataTable columns={columns} data={sales} actions={saleActions} />
      </div>
    </>
  );
}
