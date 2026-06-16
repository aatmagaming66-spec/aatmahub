'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Loader2, 
  Bell, 
  ShieldCheck, 
  Sparkles, 
  Wallet, 
  Package,
  ShieldAlert
} from 'lucide-react';

/**
 * Broadcast Sector (Notification Settings)
 * Optimized for 0ms render-blocking and instant shell visibility.
 */
export default function NotificationSettingsPage() {
  const { user, profile, initialized } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    orderUpdates: true,
    walletUpdates: true,
    promotional: false,
    securityAlerts: true
  });

  // Background hydration: Update state when profile data arrives
  useEffect(() => {
    if (profile?.notifications) {
      setSettings(profile.notifications);
    }
  }, [profile]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Session Lost', description: 'Please login to save preferences.' });
      return;
    }
    
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        notifications: settings,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Preferences Updated",
        description: "Your notification settings have been synchronized.",
      });
    } catch (error: any) {
      console.error('Save failed:', error);
      toast({
        variant: 'destructive',
        title: 'Update Rejected',
        description: error.message || 'An internal system error occurred.',
      });
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-2xl font-headline font-black tracking-tighter uppercase leading-none text-white">Broadcast Sector</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Communication Protocols</p>
        </div>
      </header>

      <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
        <CardHeader className="p-8 text-center border-b border-white/5 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Bell size={30} className="text-primary" />
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tighter text-white">Alert Matrix</CardTitle>
          <CardDescription className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Configure global system notifications</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            <NotificationToggle 
              icon={Package}
              color="text-primary"
              title="Order Updates"
              description="Status changes and fulfillment logs"
              checked={settings.orderUpdates}
              onCheckedChange={() => handleToggle('orderUpdates')}
            />
            <NotificationToggle 
              icon={Wallet}
              color="text-accent"
              title="Wallet Updates"
              description="Credits, deposits, and rewards"
              checked={settings.walletUpdates}
              onCheckedChange={() => handleToggle('walletUpdates')}
            />
            <NotificationToggle 
              icon={Sparkles}
              color="text-primary"
              title="Promotional"
              description="Special offers and rank bonuses"
              checked={settings.promotional}
              onCheckedChange={() => handleToggle('promotional')}
            />
            <NotificationToggle 
              icon={ShieldAlert}
              color="text-accent"
              title="Security Alerts"
              description="Login activity and identity checks"
              checked={settings.securityAlerts}
              onCheckedChange={() => handleToggle('securityAlerts')}
            />
          </div>

          <Button 
            onClick={handleSave}
            className="w-full h-16 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-primary/20 gap-2 mt-4"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Protocols...
              </>
            ) : (
              <>
                <ShieldCheck size={18} /> Synchronize Preferences
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Note</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          System-critical alerts cannot be disabled. These settings affect non-critical dashboard broadcasts and secondary communication channels.
        </p>
      </div>
    </div>
  );
}

function NotificationToggle({ icon: Icon, color, title, description, checked, onCheckedChange }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
        <div className="space-y-0.5 text-left">
          <Label className="text-xs font-black uppercase tracking-tight text-white/90 cursor-pointer">{title}</Label>
          <p className="text-[8px] text-muted-foreground uppercase font-black">{description}</p>
        </div>
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}
