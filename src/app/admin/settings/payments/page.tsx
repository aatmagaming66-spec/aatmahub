
'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, ShieldCheck, Zap, Loader2, Smartphone, Key } from 'lucide-react';

export default function PaymentSettingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    upiKey: '',
    upiToken: '',
    isUpiEnabled: false,
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'payments'));
        if (snap.exists()) {
          setSettings(snap.data() as any);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [db]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'payments'), {
        ...settings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      toast({ title: "UPI Protocol Secured", description: "Gateway configuration updated successfully." });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Save Failed", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Payment Gateway</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">UPI Financial Protocol Hub</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-white">
              <Smartphone className="h-4 w-4 text-primary" /> UPI Gateway Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="space-y-0.5">
                <Label className="text-sm font-black uppercase tracking-tight">Enable UPI Gateway</Label>
                <p className="text-[9px] text-muted-foreground uppercase font-black">Toggle live gateway status</p>
              </div>
              <Switch 
                checked={settings.isUpiEnabled} 
                onCheckedChange={(val) => setSettings({...settings, isUpiEnabled: val})}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Gateway API Key</Label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input 
                  placeholder="Enter API Key" 
                  value={settings.upiKey}
                  onChange={(e) => setSettings({...settings, upiKey: e.target.value})}
                  className="bg-black/50 border-border h-14 rounded-xl pl-12 focus:border-primary font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">API Token</Label>
              <Input 
                type="password"
                placeholder="Enter Gateway Token" 
                value={settings.upiToken}
                onChange={(e) => setSettings({...settings, upiToken: e.target.value})}
                className="bg-black/50 border-border h-14 rounded-xl focus:border-primary font-bold"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-xl font-black uppercase text-[11px] tracking-widest mt-4 shadow-xl shadow-primary/20">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save UPI Configuration"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-white">
              <ShieldCheck className="h-4 w-4 text-accent" /> Security Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Integration Note</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase leading-relaxed">
                1. Ensure your API Key and Token are from a verified UPI aggregator.<br/>
                2. Callbacks are received via HTTPS POST signals.<br/>
                3. Orders transition to <code className="text-white">processing</code> automatically upon verified payment.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-2xl space-y-2">
              <span className="text-[9px] font-black uppercase text-muted-foreground">Global Callback Endpoint</span>
              <p className="text-[10px] font-bold text-white break-all bg-black/40 p-3 rounded-lg border border-white/5">
                /api/payments/upi/callback
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
