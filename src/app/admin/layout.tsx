'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { AdminNav } from '@/components/admin/admin-nav';
import { Loader2, Menu, X, ShieldCheck, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, initialized } = useUser();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasAdminAccess = profile?.role === 'admin' || profile?.role === 'super_admin';

  useEffect(() => {
    if (initialized && isMounted) {
      if (!user || !hasAdminAccess) {
        setAccessDenied(true);
        const timer = setTimeout(() => router.replace('/'), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, profile, initialized, hasAdminAccess, router, isMounted]);

  if (!isMounted || !initialized) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Syncing Admin Session...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex h-screen items-center justify-center p-6 text-center">
        <div className="space-y-4 animate-in fade-in zoom-in duration-500">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Access Restricted</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Insufficient permissions for core operations</p>
          <p className="text-[8px] text-primary/50 font-black uppercase">Redirecting to base...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasAdminAccess) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border flex-col bg-background/50 backdrop-blur-xl shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="font-headline font-black text-lg tracking-tighter">
            <span className="text-primary">AATMA</span> HUB <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-none ml-2 uppercase">Core</span>
          </span>
        </div>
        <AdminNav onItemClick={() => setIsMobileNavOpen(false)} />
      </aside>

      {/* Mobile Nav Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border animate-in slide-in-from-left duration-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-border">
              <span className="font-headline font-black text-sm tracking-tighter uppercase">AATMA <span className="text-primary">ADMIN</span></span>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileNavOpen(false)} className="rounded-none">
                <X size={20} />
              </Button>
            </div>
            <AdminNav onItemClick={() => setIsMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-background/50 backdrop-blur-md z-30 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden rounded-none" onClick={() => setIsMobileNavOpen(true)}>
              <Menu size={20} />
            </Button>
            <div className="hidden sm:block"><span className="font-headline font-black text-sm tracking-tighter uppercase">AATMA <span className="text-primary">HUB</span></span></div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-green-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Identity:</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-green-500">{profile?.role?.replace('_', ' ')}</span>
            </div>
            <div className="h-2 w-2 rounded-none bg-green-500 animate-pulse" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar pb-24 lg:pb-8 bg-background">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}