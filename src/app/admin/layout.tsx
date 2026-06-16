'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { AdminNav } from '@/components/admin/admin-nav';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  // Audit: A super_admin is inherently an admin
  const hasAdminAccess = profile?.role === 'admin' || profile?.role === 'super_admin';

  useEffect(() => {
    if (!loading) {
      if (!user || !hasAdminAccess) {
        console.warn(`[Admin Audit] Unauthorized access attempt. Redirecting to root.`);
        router.push('/');
      } else {
        console.log(`[Admin Audit] Session Authorized: Role=${profile?.role}`);
      }
    }
  }, [user, profile, loading, hasAdminAccess, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Synchronizing Admin Session...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasAdminAccess) {
    return null; // Let the useEffect handle redirection
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 border-r border-border flex-col bg-background/50 backdrop-blur-xl">
        <div className="h-14 flex items-center px-6 border-b border-border">
          <span className="font-headline font-black text-lg tracking-tighter">
            <span className="text-primary">AATMA</span> HUB <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">ADMIN</span>
          </span>
        </div>
        <AdminNav />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-md z-30">
          <div className="lg:hidden">
             <span className="font-headline font-black text-sm tracking-tighter">AATMA <span className="text-primary">ADMIN</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Session Status:</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Active</span>
            </div>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar pb-24 lg:pb-8 bg-background">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
