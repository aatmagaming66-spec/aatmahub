
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Fingerprint, 
  ShieldCheck, 
  Smartphone, 
  History, 
  ChevronRight,
  ShieldAlert,
  Trash2,
  Lock,
  Loader2,
  KeyRound
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SecuritySettingsPage() {
  const { user, profile, initialized } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const toggle2FA = async (enabled: boolean) => {
    if (!user) return;
    setUpdating(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        is2FAEnabled: enabled,
        updatedAt: new Date().toISOString()
      });
      toast({ 
        title: enabled ? "2FA Engaged" : "2FA Disengaged", 
        description: `Security protocol updated for ${user.email}.` 
      });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Action Failed', description: e.message });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-200">
      <header className="flex items-center gap-4 py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-none hover:bg-white/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-headline font-black tracking-tighter uppercase leading-none">Security Sector</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Identity Protection Layer</p>
        </div>
      </header>

      <Card className="bg-card border-border rounded-none overflow-hidden shadow-2xl">
        <CardHeader className="p-8 text-center border-b border-white/5 bg-gradient-to-b from-accent/5 to-transparent">
          <div className="h-16 w-16 bg-accent/10 rounded-none flex items-center justify-center mx-auto mb-4 border border-accent/20">
            <Fingerprint size={30} className="text-accent" />
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tighter text-white">Security Matrix</CardTitle>
          <CardDescription className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Manage multi-factor auth and session control</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            <div className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-none bg-white/5 flex items-center justify-center text-white/80">
                  <KeyRound size={18} />
                </div>
                <div className="text-left space-y-0.5">
                  <Label className="text-xs font-black uppercase tracking-tight text-white/90">2-Factor Authentication</Label>
                  <p className="text-[8px] text-muted-foreground uppercase font-black">Requires OTP for every login</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {updating ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : (
                  <Switch 
                    checked={profile?.is2FAEnabled || false} 
                    onCheckedChange={toggle2FA}
                    className="data-[state=checked]:bg-accent"
                  />
                )}
              </div>
            </div>

            <SecurityActionItem 
              icon={Smartphone}
              title="Identity Method"
              description={profile?.authProvider === 'google.com' ? "Google OAuth 2.0" : "Legacy Password"}
              status={profile?.authProvider === 'google.com' ? "OAuth" : "Basic"}
              color="text-primary"
            />
            
            <SecurityActionItem 
              icon={History}
              title="Active Sessions"
              description="Audit all connected devices"
              status="Live"
              color="text-green-500"
            />

            <SecurityActionItem 
              icon={Trash2}
              title="Purge Identity"
              description="Permanently delete hub account"
              status="Restricted"
              color="text-white/20"
              danger
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-accent/5 p-6 rounded-none border border-accent/10 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest text-accent">Protocol Alert</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          Enabling multi-factor authentication (2FA) adds a critical security layer. Verification via 6-digit code will be mandatory for all future authorization attempts.
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
          "h-10 w-10 rounded-none bg-white/5 flex items-center justify-center transition-transform group-active:scale-95",
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
