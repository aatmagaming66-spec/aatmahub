'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, setDoc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Home, Layout, Save, Loader2, Sparkles } from 'lucide-react';

export default function HomepageManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const configRef = useMemo(() => doc(db, 'settings', 'site'), [db]);
  const { data: siteData, loading } = useDoc(configRef);

  const [saving, setSaving] = useState(false);
  const [localLayout, setLocalLayout] = useState<any>(null);

  useEffect(() => {
    if (siteData?.homepage) {
      setLocalLayout(siteData.homepage);
    }
  }, [siteData]);

  const settings = localLayout || {
    showGames: true,
    showSocial: true,
    showLiveActivity: true,
    showTrustBadges: true,
  };

  const handleToggle = (key: string, val: boolean) => {
    setLocalLayout({ ...settings, [key]: val });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(configRef, { 
        homepage: settings, 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
      toast({ title: 'Homepage Updated', description: 'Homepage layout settings have been saved.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !localLayout) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Homepage Sections</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Manage visible sections on your homepage</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 gap-2">
          {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save size={16} /> Save Settings</>}
        </Button>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border bg-black/20">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Layout className="h-4 w-4 text-primary" /> Visibility Toggles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {[
              { key: 'showGames', label: 'Mobile Games Grid', desc: 'Display regional game top-ups' },
              { key: 'showSocial', label: 'Social Services Hub', desc: 'Show social media growth services' },
              { key: 'showLiveActivity', label: 'Live Activity Feed', desc: 'Show recent order notifications' },
              { key: 'showTrustBadges', label: 'Trust Badges', desc: 'Show security and safety badges' },
            ].map((section) => (
              <div key={section.key} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="space-y-0.5">
                  <Label className="text-[11px] font-black uppercase tracking-tight">{section.label}</Label>
                  <p className="text-[8px] text-muted-foreground uppercase font-black">{section.desc}</p>
                </div>
                <Switch 
                  checked={settings[section.key]} 
                  onCheckedChange={(val) => handleToggle(section.key, val)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="bg-accent/5 p-8 rounded-[2.5rem] border border-accent/10 space-y-4">
             <div className="flex items-center gap-2">
               <Sparkles className="h-4 w-4 text-accent" />
               <h3 className="text-[10px] font-black uppercase tracking-widest text-accent">Site Configuration</h3>
             </div>
             <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
               These toggles allow you to quickly hide or show main sections on the homepage. Changes reflect for all users instantly after saving.
             </p>
          </div>
          
          <Card className="bg-card border-border rounded-[2.5rem] p-8 shadow-2xl flex items-center justify-center text-center opacity-40">
             <div className="space-y-2">
               <Home className="mx-auto h-10 w-10 text-muted-foreground" />
               <p className="text-[9px] font-black uppercase tracking-widest">More Layout Options Coming Soon</p>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
