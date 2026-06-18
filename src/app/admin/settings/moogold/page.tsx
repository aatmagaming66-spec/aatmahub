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
import { Zap, ShieldCheck, Loader2, Database, Globe } from 'lucide-react';

export default function MooGoldSettingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    partnerId: '',
    secretKey: '',
    isEnabled: false,
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'moogold'));
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
      await setDoc(doc(db, 'settings', 'moogold'), {
        ...settings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      toast({ title: "Settings Saved", description: "MooGold credentials updated successfully." });
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
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase text-white">MooGold Settings</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Order Fulfillment Config</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-card border-border rounded-none overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> API Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-none border border-white/5">
              <div className="space-y-0.5">
                <Label className="text-sm font-black uppercase tracking-tight">Status</Label>
                <p className="text-[9px] text-muted-foreground uppercase font-black">Enable MooGold Fulfillment</p>
              </div>
              <Switch 
                checked={settings.isEnabled} 
                onCheckedChange={(val) => setSettings({...settings, isEnabled: val})}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Partner ID</Label>
              <Input 
                placeholder="Your MooGold Partner ID" 
                value={settings.partnerId}
                onChange={(e) => setSettings({...settings, partnerId: e.target.value})}
                className="bg-black/50 border-border h-12 rounded-none focus:border-primary font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Secret Key</Label>
              <Input 
                type="password"
                placeholder="Your MooGold Secret Key" 
                value={settings.secretKey}
                onChange={(e) => setSettings({...settings, secretKey: e.target.value})}
                className="bg-black/50 border-border h-12 rounded-none focus:border-primary font-bold"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-none font-black uppercase text-[11px] tracking-widest mt-4">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save MooGold Config"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-none overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Globe className="h-4 w-4 text-accent" /> Fulfillment Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="bg-primary/5 p-6 rounded-none border border-primary/10 space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Automation Note</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
                MooGold is typically used as a backup fulfillment provider. Ensure the Product ID mappings match MooGold's SKU list exactly to prevent delivery errors.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-none space-y-2 bg-black/20">
              <ShieldCheck className="h-5 w-5 text-green-500 mb-2" />
              <span className="text-[9px] font-black uppercase text-muted-foreground">Security Check</span>
              <p className="text-[10px] font-bold text-white leading-relaxed uppercase">
                All requests are signed using HMAC-SHA256. Do not share your Secret Key with anyone.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
