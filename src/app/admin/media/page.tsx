'use client';

import { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, setDoc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Palette, Loader2, Save, Sparkles } from 'lucide-react';

export default function MediaManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const brandingRef = useMemo(() => doc(db, 'settings', 'branding'), [db]);
  const { data: branding, loading } = useDoc(brandingRef);

  const [saving, setSaving] = useState(false);
  const [siteTitle, setSiteTitle] = useState('');

  useMemo(() => {
    if (branding?.heroTitle) setSiteTitle(branding.heroTitle);
  }, [branding]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(brandingRef, { heroTitle: siteTitle, updatedAt: new Date().toISOString() }, { merge: true });
      toast({ title: 'Branding Synchronized', description: 'Site identity updated.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Sync Failed', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Branding Sector</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Identity & Visual Control</p>
      </header>

      <div className="max-w-2xl">
        <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border bg-black/20">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" /> Visual Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Website Header Title</Label>
              <Input 
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                placeholder="AATMA HUB"
                className="bg-black/50 border-border h-14 rounded-2xl focus:border-primary font-bold text-sm"
              />
              <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest px-1">This text appears in the top header and hero banner.</p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest mt-4 shadow-xl shadow-primary/10">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Save Master Configuration</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3 max-w-2xl">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Identity Protocol</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          The AATMA HUB platform is now operating in high-performance Image-Free mode. Branding is defined by typography, gradients, and CSS-based visual cues.
        </p>
      </div>
    </div>
  );
}
