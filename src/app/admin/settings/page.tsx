
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
import { Globe, ShieldAlert, MessageCircle, Mail, Send, Loader2, Zap } from 'lucide-react';

export default function GeneralSettingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance.',
    announcementEnabled: false,
    announcementText: '',
    contactWhatsApp: '+91 8566936666',
    contactEmail: 'shivatetz@gmail.com',
    contactTelegram: '@aatmaplays',
    siteBranding: 'AATMA HUB'
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'site'));
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
      await setDoc(doc(db, 'settings', 'site'), {
        ...settings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      toast({ title: "Protocol Updated", description: "Global site settings synchronized." });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Update Failed", description: error.message });
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
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Global Settings</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">System Configuration Hub</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Core Protocol */}
        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Core Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="space-y-0.5">
                <Label className="text-sm font-black uppercase tracking-tight">Maintenance Mode</Label>
                <p className="text-[9px] text-muted-foreground uppercase font-black">Disable public access</p>
              </div>
              <Switch 
                checked={settings.maintenanceMode} 
                onCheckedChange={(val) => setSettings({...settings, maintenanceMode: val})}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Maintenance Message</Label>
              <Input 
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})}
                className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Site Branding</Label>
              <Input 
                value={settings.siteBranding}
                onChange={(e) => setSettings({...settings, siteBranding: e.target.value})}
                className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
              />
            </div>
          </CardContent>
        </Card>

        {/* Support & Communications */}
        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-accent" /> Support Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">WhatsApp Support</Label>
              <Input 
                value={settings.contactWhatsApp}
                onChange={(e) => setSettings({...settings, contactWhatsApp: e.target.value})}
                className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Telegram Handle</Label>
              <Input 
                value={settings.contactTelegram}
                onChange={(e) => setSettings({...settings, contactTelegram: e.target.value})}
                className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Official Email</Label>
              <Input 
                value={settings.contactEmail}
                onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-primary h-14 px-10 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-primary/20">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Zap className="mr-2 h-4 w-4" /> Save Master Configuration</>}
        </Button>
      </div>
    </div>
  );
}
