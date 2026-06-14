
import type { Metadata } from 'next';
import './globals.css';
import { TopHeader } from '@/components/navigation/top-header';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/app-sidebar';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'AATMA HUB - Premium Digital Solutions',
  description: 'Premium Digital Solutions for Gaming and Social Needs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen flex flex-col">
        <FirebaseClientProvider>
          <SidebarProvider defaultOpen={false}>
            <div className="flex w-full min-h-screen">
              <AppSidebar />
              <div className="flex-1 flex flex-col w-full relative">
                <TopHeader />
                <main className="flex-1 pb-20 w-full overflow-x-hidden">
                  {children}
                </main>
                <BottomNav />
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
