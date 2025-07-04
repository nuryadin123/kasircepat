'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns, saleActions } from '@/components/reports/columns';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { Sale } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>();
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
  
  const filteredSales = sales.filter(sale => {
    if (!date || !date.from) {
      return true; // If no date range is selected, show all sales
    }
    const saleDate = new Date(sale.date);
    const from = new Date(date.from);
    from.setHours(0, 0, 0, 0);

    // If 'to' is not selected, use 'from' as 'to' as well (single day selection)
    const to = date.to ? new Date(date.to) : new Date(date.from);
    to.setHours(23, 59, 59, 999);

    return saleDate >= from && saleDate <= to;
  });

  const handleExportPDF = (dataToExport: Sale[]) => {
    if (dataToExport.length === 0) {
      toast({
        title: "Tidak Ada Data",
        description: "Tidak ada data penjualan pada rentang tanggal yang dipilih untuk diekspor.",
        variant: "destructive",
      });
      return;
    }
    setIsExporting(true);
    try {
        const doc = new jsPDF();
        const storeName = localStorage.getItem('storeName') || 'Kasiran App';
        const generatedDate = new Date().toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        // --- PDF HEADER ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text(storeName, 14, 22);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text('Laporan Penjualan', 14, 30);
        doc.setFontSize(10);
        doc.text(`Tanggal Dibuat: ${generatedDate}`, 14, 35);
        if (date?.from) {
             doc.text(
                `Periode: ${format(date.from, "d LLL yyyy")} - ${format(date.to || date.from, "d LLL yyyy")}`,
                14,
                40
            );
        }

        // --- SUMMARY TABLE ---
        (doc as any).autoTable({
            startY: 48,
            head: [['No. Transaksi', 'Tanggal', 'Jumlah Item', 'Total']],
            body: dataToExport.map(sale => [
                sale.transactionId || sale.id.substring(0, 7).toUpperCase(),
                new Date(sale.date).toLocaleString('id-ID'),
                sale.items.reduce((sum, item) => sum + item.quantity, 0),
                `Rp${new Intl.NumberFormat('id-ID').format(sale.total)}`
            ]),
            headStyles: { fillColor: [63, 81, 181] },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            styles: { font: 'helvetica', fontSize: 9 },
            theme: 'striped',
        });

        let finalY = (doc as any).lastAutoTable.finalY;

        // --- DETAILED SECTION ---
        finalY += 15;
        
        if (finalY > 270) {
            doc.addPage();
            finalY = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Detail Penjualan per Transaksi', 14, finalY);
        finalY += 10;
        
        dataToExport.forEach((sale, index) => {
            const itemsHeight = sale.items.length * 7;
            const summaryHeight = 25;
            const blockHeight = 15 + itemsHeight + summaryHeight;

            if (finalY + blockHeight > 280) {
                doc.addPage();
                finalY = 20;
            }

            if (index > 0) {
                doc.setDrawColor(200);
                doc.line(14, finalY - 5, doc.internal.pageSize.width - 14, finalY - 5);
            }

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(
                `No. Transaksi: ${sale.transactionId || sale.id.substring(0, 7).toUpperCase()}`,
                14,
                finalY
            );
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(
                `Tanggal: ${new Date(sale.date).toLocaleString('id-ID')}`,
                doc.internal.pageSize.width - 14,
                finalY,
                { align: 'right' }
            );
            finalY += 8;

            (doc as any).autoTable({
                startY: finalY,
                head: [['Nama Produk', 'Kuantitas', 'Harga Satuan', 'Subtotal']],
                body: sale.items.map(item => [
                    item.name,
                    item.quantity,
                    `Rp${new Intl.NumberFormat('id-ID').format(item.price)}`,
                    `Rp${new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}`
                ]),
                theme: 'grid',
                headStyles: { fillColor: [241, 245, 249], textColor: 20, fontStyle: 'bold', fontSize: 9 },
                styles: { font: 'helvetica', fontSize: 8 },
                margin: { left: 14, right: 14 },
            });

            finalY = (doc as any).lastAutoTable.finalY;

            const subtotal = sale.subtotal ?? sale.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            const discountAmount = sale.discountAmount ?? 0;

            finalY += 6;
            doc.setFontSize(9);
            doc.text(
                `Subtotal: Rp${new Intl.NumberFormat('id-ID').format(subtotal)}`,
                doc.internal.pageSize.width - 14,
                finalY,
                { align: 'right' }
            );

            if (discountAmount > 0) {
                finalY += 5;
                 doc.text(
                    `Diskon: -Rp${new Intl.NumberFormat('id-ID').format(discountAmount)}`,
                    doc.internal.pageSize.width - 14,
                    finalY,
                    { align: 'right' }
                );
            }
            
            finalY += 5;
            doc.setFont('helvetica', 'bold');
            doc.text(
                `Total: Rp${new Intl.NumberFormat('id-ID').format(sale.total)}`,
                doc.internal.pageSize.width - 14,
                finalY,
                { align: 'right' }
            );
            
            finalY += 15;
        });
        
        const pageCount = doc.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Halaman ${i} dari ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        }


        doc.save(`Laporan-Penjualan-Detail-${storeName.replace(/\s/g, '_')}.pdf`);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">Riwayat Penjualan</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
             <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full sm:w-[260px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "d LLL, y")} -{" "}
                                    {format(date.to, "d LLL, y")}
                                </>
                            ) : (
                                format(date.from, "d LLL, y")
                            )
                        ) : (
                            <span>Pilih rentang tanggal</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={() => handleExportPDF(filteredSales)} disabled={isExporting || filteredSales.length === 0}>
                {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                {isExporting ? 'Mengekspor...' : 'Ekspor'}
            </Button>
        </div>
      </div>
      <div className="mt-4">
        <DataTable columns={columns} data={filteredSales} actions={saleActions} />
      </div>
    </>
  );
}
