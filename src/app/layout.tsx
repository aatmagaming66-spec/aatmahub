import type { Metadata } from 'next';
import './globals.css';
import { TopHeader } from '@/components/navigation/top-header';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/app-sidebar';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { AnnouncementBar } from '@/components/navigation/announcement-bar';
import { MaintenanceCheck } from '@/components/navigation/maintenance-check';

export const metadata: Metadata = {
  metadataBase: new URL('https://aatmahub.com'),
  title: 'AATMA HUB - Premium Digital Solutions',
  description: 'Premium Digital Solutions for Gaming and Social Needs. Instant top-ups, OTT access, and social media growth.',
  keywords: ['MLBB Top up', 'Free Fire Diamonds', 'OTT Premium', 'Gaming India', 'Social Media Services'],
  authors: [{ name: 'AATMA OFFICIAL' }],
  openGraph: {
    title: 'AATMA HUB - Premium Digital Marketplace',
    description: 'Instant Game Top-Ups, OTT Services, and Social Growth.',
    url: 'https://aatmahub.com',
    siteName: 'AATMA HUB',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AATMA HUB | Gaming & Social Solutions',
    description: 'India\'s fastest digital service hub.',
  },
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
          <CartProvider>
            <SidebarProvider defaultOpen={false}>
              <div className="flex w-full min-h-screen">
                <AppSidebar />
                <div className="flex-1 flex flex-col w-full relative">
                  <MaintenanceCheck />
                  <AnnouncementBar />
                  <TopHeader />
                  <main className="flex-1 pb-20 w-full overflow-x-hidden">
                    {children}
                  </main>
                  <BottomNav />
                </div>
              </div>
            </SidebarProvider>
            <Toaster />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
