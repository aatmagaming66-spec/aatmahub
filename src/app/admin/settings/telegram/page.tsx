
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
import { Send, ShieldCheck, Zap, Loader2, Bot } from 'lucide-react';

export default function TelegramSettingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    botToken: '',
    adminChatId: '',
    notificationsEnabled: false,
    controlsEnabled: false,
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'telegram'));
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
      await setDoc(doc(db, 'settings', 'telegram'), {
        ...settings,
        lastSync: new Date().toISOString(),
      }, { merge: true });
      toast({ title: "Configuration Secured", description: "Telegram Bot settings updated successfully." });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Save Failed", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!settings.botToken || !settings.adminChatId) {
      toast({ variant: 'destructive', title: "Missing Data", description: "Token and Chat ID are required for testing." });
      return;
    }
    try {
      const url = `https://api.telegram.org/bot${settings.botToken}/getMe`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) {
        toast({ title: "Connection Active", description: `Bot @${data.result.username} is responsive.` });
      } else {
        throw new Error(data.description);
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: "Connection Failed", description: e.message });
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
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Telegram Integration</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Operations Control Center</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" /> Bot Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bot API Token</Label>
              <Input 
                type="password"
                placeholder="123456789:ABCDE..." 
                value={settings.botToken}
                onChange={(e) => setSettings({...settings, botToken: e.target.value})}
                className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin Chat ID</Label>
              <Input 
                placeholder="-100123456789" 
                value={settings.adminChatId}
                onChange={(e) => setSettings({...settings, adminChatId: e.target.value})}
                className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
              />
              <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest px-1">Use @userinfobot to find your ID</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary h-12 rounded-xl font-black uppercase text-[10px] tracking-widest">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Config"}
              </Button>
              <Button onClick={testConnection} variant="outline" className="flex-1 border-border h-12 rounded-xl font-black uppercase text-[10px] tracking-widest">
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" /> Control Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-black uppercase tracking-tight">Enable Notifications</Label>
                <p className="text-[9px] text-muted-foreground uppercase font-black">Alerts for orders, deposits, and users</p>
              </div>
              <Switch 
                checked={settings.notificationsEnabled} 
                onCheckedChange={(val) => setSettings({...settings, notificationsEnabled: val})}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-black uppercase tracking-tight">Enable Remote Controls</Label>
                <p className="text-[9px] text-muted-foreground uppercase font-black">Approve/Reject from Telegram buttons</p>
              </div>
              <Switch 
                checked={settings.controlsEnabled} 
                onCheckedChange={(val) => setSettings({...settings, controlsEnabled: val})}
                className="data-[state=checked]:bg-accent"
              />
            </div>
            
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Webhook Setup</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase leading-relaxed">
                Set your webhook to: <br/>
                <code className="text-white bg-black/40 px-2 py-0.5 rounded text-[8px]">https://your-domain.com/api/telegram/webhook</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
