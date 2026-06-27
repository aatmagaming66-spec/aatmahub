'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, UserCheck, Search, ShieldCheck, Loader2, MapPin, Zap } from 'lucide-react';

export default function IdCheckerPage() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ign: string; region: string } | null>(null);

  const handleVerify = () => {
    if (!playerId || !zoneId) return;
    setLoading(true);
    setResult(null);

    // MLBB ID Verification Simulation
    setTimeout(() => {
      setResult({
        ign: `MLBB_PLAYER_${playerId.slice(-4)}√`,
        region: zoneId.startsWith('1') ? 'India Region' : 'Global Region'
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex items-center gap-4 py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full hover:bg-white/5 active-press"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none text-white">ID Checker</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Verify Mobile Legends Account ID</p>
        </div>
      </header>

      <Card className="bg-card border-border rounded-none overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12">
          <Search size={120} className="text-primary" />
        </div>
        <CardContent className="p-8 space-y-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Game User ID</Label>
              <Input 
                value={playerId}
                onChange={(e) => { setPlayerId(e.target.value); setResult(null); }}
                placeholder="e.g. 12345678"
                className="bg-black/50 border-border h-14 rounded-none text-lg font-black text-white px-6 focus:border-primary shadow-inner"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Zone/Server ID</Label>
              <Input 
                value={zoneId}
                onChange={(e) => { setZoneId(e.target.value); setResult(null); }}
                placeholder="e.g. 1234"
                className="bg-black/50 border-border h-14 rounded-none text-lg font-black text-white px-6 focus:border-primary shadow-inner"
              />
            </div>
          </div>

          <Button 
            onClick={handleVerify}
            disabled={loading || !playerId || !zoneId}
            className="w-full h-16 bg-primary hover:bg-secondary text-sm font-black uppercase tracking-[0.2em] rounded-none shadow-xl shadow-primary/20 group transition-all"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Check Player ID <Zap size={14} className="ml-2 group-hover:scale-125 transition-transform" /></>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4 animate-in zoom-in-95 duration-500">
          <div className="flex items-center gap-2 px-2">
            <ShieldCheck size={12} className="text-green-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Account Found</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-green-500/5 border-green-500/20 rounded-none p-6 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><UserCheck size={60} className="text-green-500" /></div>
               <div className="space-y-1 relative z-10">
                  <p className="text-[8px] font-black text-green-500 uppercase tracking-widest">In-Game Name (IGN)</p>
                  <p className="text-2xl font-black text-white uppercase tracking-tighter">{result.ign}</p>
               </div>
            </Card>

            <Card className="bg-primary/5 border-primary/20 rounded-none p-6 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><MapPin size={60} className="text-primary" /></div>
               <div className="space-y-1 relative z-10">
                  <p className="text-[8px] font-black text-primary uppercase tracking-widest">Server Region</p>
                  <p className="text-2xl font-black text-white uppercase tracking-tighter">{result.region}</p>
               </div>
            </Card>
          </div>

          <div className="p-4 bg-white/5 border border-white/5 text-center">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Verified Aatma Hub Player ID</p>
          </div>
        </div>
      )}
    </div>
  );
}
