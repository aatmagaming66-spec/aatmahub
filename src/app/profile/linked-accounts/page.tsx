'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Link as LinkIcon, 
  Globe, 
  ChevronRight,
  ShieldCheck,
  Facebook,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Linked Accounts Sector
 * Optimized for instant shell mounting and zero-latency navigation.
 */
export default function LinkedAccountsPage() {
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
          <h1 className="text-2xl font-headline font-black tracking-tighter uppercase leading-none text-white">Identity Sector</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Cross-Platform Linkage</p>
        </div>
      </header>

      <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
        <CardHeader className="p-8 text-center border-b border-white/5 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <LinkIcon size={30} className="text-primary" />
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tighter text-white">Linked Identities</CardTitle>
          <CardDescription className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Manage your third-party connections</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            <LinkedAccountItem 
              icon={Mail}
              title="Email Authentication"
              description="Primary sign-in method"
              status="Connected"
              color="text-primary"
            />
            <LinkedAccountItem 
              icon={Globe}
              title="Google Identity"
              description="Sync your Google account"
              status="Disconnected"
              color="text-white/20"
            />
            <LinkedAccountItem 
              icon={Facebook}
              title="Facebook Connect"
              description="Legacy social linkage"
              status="Unavailable"
              color="text-white/20"
              disabled
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Identity Protocol</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          Linking multiple accounts allows you to recover access to the HUB through different authentication vectors. Secure your primary email before modifying linked identities.
        </p>
      </div>
    </div>
  );
}

function LinkedAccountItem({ icon: Icon, title, description, status, color, disabled }: any) {
  return (
    <button 
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-between p-6 transition-colors group",
        disabled ? "opacity-40 grayscale cursor-not-allowed" : "hover:bg-white/5"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center transition-transform group-active:scale-95 text-white/80">
          <Icon size={18} />
        </div>
        <div className="text-left space-y-0.5">
          <p className="text-xs font-black uppercase tracking-tight text-white/90">{title}</p>
          <p className="text-[8px] text-muted-foreground uppercase font-black">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn("text-[9px] font-black uppercase tracking-widest", color)}>{status}</span>
        {!disabled && <ChevronRight size={14} className="text-white/20" />}
      </div>
    </button>
  );
}
