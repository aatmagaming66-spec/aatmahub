import type { Metadata, Viewport } from 'next';
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

// Explicit viewport optimization for zero-delay taps
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: 'resizes-content',
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
        {/* Force early hardware acceleration */}
        <style dangerouslySetInnerHTML={{ __html: `
          * { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
          .page-shell { transform: translate3d(0,0,0); backface-visibility: hidden; }
        `}} />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen overflow-x-hidden">
        <FirebaseClientProvider>
          <CartProvider>
            <SidebarProvider defaultOpen={false}>
              <div className="flex w-full min-h-screen relative">
                <AppSidebar />
                <div className="flex-1 flex flex-col w-full min-w-0">
                  <MaintenanceCheck />
                  {/* Sticky Top Navigation Region */}
                  <div className="sticky top-0 z-40 w-full flex flex-col">
                    <AnnouncementBar />
                    <TopHeader />
                  </div>
                  {/* Main Content Region */}
                  <main className="flex-1 w-full pb-16">
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
