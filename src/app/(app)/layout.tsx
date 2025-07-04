import { Header } from '@/components/shared/header';
import { Sidebar } from '@/components/shared/sidebar';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // We can get the page title from route metadata in a real app
  // For now, it will be hardcoded in each page component
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        {/* The Header component will be rendered by each page to pass the title */}
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 print:hidden">
            {children}
        </main>
      </div>
    </div>
  );
}
