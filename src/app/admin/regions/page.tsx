'use client';

import { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, updateDoc, doc, setDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Plus, Loader2, Globe2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_REGIONS = [
  { id: 'mlbb-in', name: 'MLBB India', flag: '🇮🇳' },
  { id: 'mlbb-id', name: 'MLBB Indonesia', flag: '🇮🇩' },
  { id: 'mlbb-ph', name: 'MLBB Philippines', flag: '🇵🇭' },
  { id: 'mlbb-my', name: 'MLBB Malaysia', flag: '🇲🇾' },
  { id: 'mlbb-sg', name: 'MLBB Singapore', flag: '🇸🇬' },
  { id: 'mlbb-ru', name: 'MLBB Russia', flag: '🇷🇺' },
  { id: 'mlbb-br', name: 'MLBB Brazil', flag: '🇧🇷' },
];

export default function AdminRegionsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  // Stabilize the collection reference
  const regionsRef = useMemo(() => collection(db, 'regions'), [db]);
  const { data: regions, loading } = useCollection(regionsRef);

  const toggleRegion = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
      await updateDoc(doc(db, 'regions', id), { status: newStatus });
      toast({ title: "Status Updated", description: `${id} is now ${newStatus}.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Update Failed", description: error.message });
    }
  };

  const seedRegions = async () => {
    try {
      for (const r of DEFAULT_REGIONS) {
        await setDoc(doc(db, 'regions', r.id), {
          ...r,
          status: 'enabled',
          updatedAt: new Date().toISOString()
        });
      }
      toast({ title: "Seeds Planted", description: "Global regions initialized." });
    } catch (error: any) {
       toast({ variant: 'destructive', title: "Seed Failed", description: error.message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Regional Grid</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Global Distribution Logic</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={seedRegions}
            className="h-12 px-6 rounded-2xl bg-secondary hover:bg-white/5 border border-border font-black uppercase text-[10px] tracking-widest gap-2"
          >
            <Globe2 className="h-4 w-4" /> Seed Regions
          </Button>
          <Button className="h-12 px-6 rounded-2xl bg-primary hover:bg-secondary font-black uppercase text-[10px] tracking-widest gap-2">
            <Plus className="h-4 w-4" /> Add Region
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      ) : regions.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[2.5rem] p-20 text-center space-y-4">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">Global Registry is Empty</p>
           <Button variant="link" onClick={seedRegions} className="text-primary font-black uppercase text-[10px]">Initialize System Defaults</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map((region) => (
            <Card key={region.id} className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl relative group hover:border-primary/20 transition-all">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl bg-black/40 h-14 w-14 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                      {region.flag}
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-tight">{region.name}</h3>
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{region.id}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-tighter border ${
                    region.status === 'enabled' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-primary/10 text-primary border-primary/10'
                  }`}>
                    {region.status}
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`h-4 w-4 ${region.status === 'enabled' ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Active Distribution</span>
                  </div>
                  <Switch 
                    checked={region.status === 'enabled'} 
                    onCheckedChange={() => toggleRegion(region.id, region.status)}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </CardContent>
              {region.status === 'enabled' && (
                <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                  <CheckCircle2 size={60} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Global Distribution Note</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          Disabling a region will immediately remove all associated products from the public marketplace. Transactions currently processing for disabled regions will still be completed.
        </p>
      </div>
    </div>
  );
}
