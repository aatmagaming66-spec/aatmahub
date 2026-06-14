
'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, ShieldCheck, Zap, Loader2, Smartphone } from 'lucide-react';

export default function PaymentSettingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    phonepeMerchantId: '',
    phonepeSaltKey: '',
    phonepeSaltIndex: '1',
    phonepeEnv: 'sandbox',
    isPhonePeEnabled: false,
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
      toast({ title: "Payments Secured", description: "Gateway configuration updated successfully." });
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
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Financial Protocol Hub</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" /> PhonePe Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="space-y-0.5">
                <Label className="text-sm font-black uppercase tracking-tight">Enable PhonePe</Label>
                <p className="text-[9px] text-muted-foreground uppercase font-black">Toggle live gateway status</p>
              </div>
              <Switch 
                checked={settings.isPhonePeEnabled} 
                onCheckedChange={(val) => setSettings({...settings, isPhonePeEnabled: val})}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Environment</Label>
              <Select 
                value={settings.phonepeEnv} 
                onValueChange={(val) => setSettings({...settings, phonepeEnv: val})}
              >
                <SelectTrigger className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold">
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="sandbox" className="text-[10px] font-black uppercase">Sandbox (Test)</SelectItem>
                  <SelectItem value="production" className="text-[10px] font-black uppercase">Production (Live)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Merchant ID</Label>
              <Input 
                placeholder="PGMDESC..." 
                value={settings.phonepeMerchantId}
                onChange={(e) => setSettings({...settings, phonepeMerchantId: e.target.value})}
                className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Salt Key</Label>
                <Input 
                  type="password"
                  placeholder="099eb0cd-..." 
                  value={settings.phonepeSaltKey}
                  onChange={(e) => setSettings({...settings, phonepeSaltKey: e.target.value})}
                  className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Salt Index</Label>
                <Input 
                  placeholder="1" 
                  value={settings.phonepeSaltIndex}
                  onChange={(e) => setSettings({...settings, phonepeSaltIndex: e.target.value})}
                  className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-12 rounded-xl font-black uppercase text-[10px] tracking-widest mt-4">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Payment Config"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" /> Security Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Integration Guide</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase leading-relaxed">
                1. Use the <code className="text-white">initiate</code> API to start transactions.<br/>
                2. PhonePe will redirect to your <code className="text-white">callback</code> URL after completion.<br/>
                3. Orders will automatically switch to <code className="text-white">processing</code> on success.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-2xl space-y-2">
              <span className="text-[9px] font-black uppercase text-muted-foreground">Callback Endpoint</span>
              <p className="text-[10px] font-bold text-white break-all bg-black/40 p-2 rounded-lg">
                /api/payments/phonepe/callback
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
