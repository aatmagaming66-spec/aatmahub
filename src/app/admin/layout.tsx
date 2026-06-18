'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { AdminNav } from '@/components/admin/admin-nav';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, initialized } = useUser();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasAdminAccess = profile?.role === 'admin' || profile?.role === 'super_admin';

  useEffect(() => {
    if (initialized && isMounted) {
      if (!user || !hasAdminAccess) {
        router.push('/');
      }
    }
  }, [user, profile, initialized, hasAdminAccess, router, isMounted]);

  if (!isMounted || !initialized) {
    return (
      <div className="flex h-screen bg-background">
        <aside className="hidden lg:flex w-64 border-r border-border flex-col bg-background/50">
          <div className="h-14 flex items-center px-6 border-b border-border"><Skeleton className="h-6 w-32 bg-white/5" /></div>
          <div className="p-4 space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl bg-white/5" />)}</div>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border bg-background/50" />
          <main className="flex-1 p-8"><div className="flex flex-col items-center justify-center h-full gap-4"><Loader2 className="h-8 w-8 text-primary animate-spin" /><p className="text-[10px] font-black uppercase tracking-widest text-primary">Syncing Admin Session...</p></div></main>
        </div>
      </div>
    );
  }

  if (!user || !hasAdminAccess) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden lg:flex w-64 border-r border-border flex-col bg-background/50 backdrop-blur-xl">
        <div className="h-14 flex items-center px-6 border-b border-border">
          <span className="font-headline font-black text-lg tracking-tighter">
            <span className="text-primary">AATMA</span> HUB <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2 uppercase">Core</span>
          </span>
        </div>
        <AdminNav />
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-md z-30">
          <div className="lg:hidden"><span className="font-headline font-black text-sm tracking-tighter uppercase">AATMA <span className="text-primary">ADMIN</span></span></div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Status:</span><span className="text-[9px] font-black uppercase tracking-widest text-green-500">Authenticated</span></div>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar pb-24 lg:pb-8 bg-background"><div className="max-w-7xl mx-auto">{children}</div></main>
      </div>
    </div>
  );
}
