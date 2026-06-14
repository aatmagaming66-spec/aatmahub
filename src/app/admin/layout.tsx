
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { AdminNav } from '@/components/admin/admin-nav';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, profile, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authenticating Admin Session...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6 text-center">
        <div className="space-y-4 max-w-sm">
          <ShieldAlert className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-2xl font-black uppercase tracking-tighter">Access Forbidden</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase leading-relaxed">
            This sector is restricted to AATMA HUB Administrative personnel only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 border-r border-border flex-col">
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
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-md">
          <div className="lg:hidden">
             <span className="font-headline font-black text-sm tracking-tighter">AATMA ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">System Status: Active</span>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar pb-24 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
