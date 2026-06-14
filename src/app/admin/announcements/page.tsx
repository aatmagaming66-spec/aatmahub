
'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, Zap, Loader2, Sparkles } from 'lucide-react';

export default function AnnouncementsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    announcementEnabled: false,
    announcementText: '',
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'site'));
        if (snap.exists()) {
          const data = snap.data();
          setSettings({
            announcementEnabled: data.announcementEnabled || false,
            announcementText: data.announcementText || '',
          });
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
      toast({ title: "Broadcast Updated", description: "Global announcement status synchronized." });
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
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Broadcasting</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Global Communication Layer</p>
      </header>

      <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl max-w-2xl">
        <CardHeader className="p-8 border-b border-border">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" /> Global Alert System
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="space-y-0.5">
              <Label className="text-sm font-black uppercase tracking-tight">Enable Announcement Bar</Label>
              <p className="text-[9px] text-muted-foreground uppercase font-black">Visibility on all client pages</p>
            </div>
            <Switch 
              checked={settings.announcementEnabled} 
              onCheckedChange={(val) => setSettings({...settings, announcementEnabled: val})}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Announcement Text</Label>
            <Textarea 
              placeholder="e.g. FLASH SALE: 20% Extra Diamonds on all MLBB India packs!" 
              value={settings.announcementText}
              onChange={(e) => setSettings({...settings, announcementText: e.target.value})}
              className="bg-black/50 border-border min-h-[100px] rounded-2xl focus:border-primary font-bold text-sm"
            />
            <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest px-1">Use emojis for higher visibility ✨</p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest mt-4 shadow-xl shadow-primary/10">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" /> Deploy Broadcast</>}
          </Button>
        </CardContent>
      </Card>

      <div className="bg-accent/5 p-6 rounded-3xl border border-accent/10 space-y-3 max-w-2xl">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest text-accent">System Note</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          The announcement bar appears at the top of the header. Keep messages concise for mobile viewing. Changes reflect instantly for all active sessions.
        </p>
      </div>
    </div>
  );
}
