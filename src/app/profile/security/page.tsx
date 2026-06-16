
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Fingerprint, 
  ShieldCheck, 
  Smartphone, 
  History, 
  ChevronRight,
  ShieldAlert,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Security Sector Page
 * Optimized for instant shell mounting and zero-latency navigation.
 */
export default function SecuritySettingsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-200">
      <header className="flex items-center gap-4 py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-headline font-black tracking-tighter uppercase leading-none text-white">Security Sector</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Identity Protection Layer</p>
        </div>
      </header>

      <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
        <CardHeader className="p-8 text-center border-b border-white/5 bg-gradient-to-b from-accent/5 to-transparent">
          <div className="h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent/20">
            <Fingerprint size={30} className="text-accent" />
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tighter text-white">Security Matrix</CardTitle>
          <CardDescription className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Manage multi-factor auth and session control</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            <SecurityActionItem 
              icon={Smartphone}
              title="Two-Factor Authentication"
              description="Verification via SMS or Email"
              status="Inactive"
              color="text-primary"
            />
            <SecurityActionItem 
              icon={History}
              title="Login Activity"
              description="Audit all active sessions"
              status="Live"
              color="text-green-500"
            />
            <SecurityActionItem 
              icon={ShieldCheck}
              title="Identity Verification"
              description="Official KYI/Verification status"
              status="Verified"
              color="text-accent"
            />
            <SecurityActionItem 
              icon={Trash2}
              title="Account Deletion"
              description="Permanently purge global identity"
              status="Restricted"
              color="text-white/20"
              danger
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-accent/5 p-6 rounded-3xl border border-accent/10 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest text-accent">Security Note</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          Enabling multi-factor authentication adds an extra layer of protection to your AATMA HUB account. Changes to critical security protocols require 24h cooldown before taking effect.
        </p>
      </div>
    </div>
  );
}

function SecurityActionItem({ icon: Icon, title, description, status, color, danger }: any) {
  return (
    <button className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center transition-transform group-active:scale-95",
          danger ? "text-white/10" : "text-white/80"
        )}>
          <Icon size={18} />
        </div>
        <div className="text-left space-y-0.5">
          <p className={cn("text-xs font-black uppercase tracking-tight", danger ? "text-white/40" : "text-white/90")}>{title}</p>
          <p className="text-[8px] text-muted-foreground uppercase font-black">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn("text-[9px] font-black uppercase tracking-widest", color)}>{status}</span>
        <ChevronRight size={14} className="text-white/20" />
      </div>
    </button>
  );
}
