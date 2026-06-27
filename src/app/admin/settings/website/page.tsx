'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Palette, Globe, Image as ImageIcon, Link as LinkIcon, Loader2, Save } from 'lucide-react';

export default function WebsiteSettingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  // Pointing to master 'site' document instead of 'branding'
  const masterRef = useMemo(() => doc(db, 'settings', 'site'), [db]);
  const { data: masterData, loading } = useDoc(masterRef);

  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    logoUrl: '/logo.png',
    heroTitle: 'Instant Game Top-Ups',
    heroSubtitle: 'Fast • Secure • Reliable',
    footerText: 'Premium Digital Solutions for Gaming and Social Needs.',
    socialInstagram: '',
    socialTelegram: '',
    socialWhatsApp: '',
  });

  useEffect(() => {
    if (masterData) {
      setSettings(prev => ({
        ...prev,
        ...masterData // Spreading master data which now contains branding fields
      }));
    }
  }, [masterData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Merging branding fields into the master site doc
      await setDoc(masterRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      toast({ title: "Branding Synchronized", description: "Website identity updated in master configuration." });
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
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Web Branding</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Identity & Design Control</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" /> Visual Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Logo Resource Path</Label>
              <Input 
                value={settings.logoUrl}
                onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hero Header Title</Label>
              <Input 
                value={settings.heroTitle}
                onChange={(e) => setSettings({...settings, heroTitle: e.target.value})}
                className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hero Subtitle</Label>
              <Input 
                value={settings.heroSubtitle}
                onChange={(e) => setSettings({...settings, heroSubtitle: e.target.value})}
                className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-accent" /> Connectivity Sector
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
             <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Instagram Official Link</Label>
              <Input 
                value={settings.socialInstagram}
                onChange={(e) => setSettings({...settings, socialInstagram: e.target.value})}
                placeholder="https://instagram.com/..."
                className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Telegram Channel</Label>
              <Input 
                value={settings.socialTelegram}
                onChange={(e) => setSettings({...settings, socialTelegram: e.target.value})}
                placeholder="https://t.me/..."
                className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Footer Legal Text</Label>
              <Input 
                value={settings.footerText}
                onChange={(e) => setSettings({...settings, footerText: e.target.value})}
                className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-primary h-14 px-10 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-primary/20 gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Branding Changes
        </Button>
      </div>
    </div>
  );
}
