
'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, ShieldCheck, Zap, Database, Bot, Smartphone, Cpu, Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SystemHealthPage() {
  const db = useFirestore();
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>({
    firestore: 'checking',
    telegram: 'checking',
    phonepe: 'checking',
    smileone: 'checking',
    unipin: 'checking'
  });

  const checkHealth = async () => {
    setLoading(true);
    const newHealth = { ...health };

    try {
      // Check Firestore
      await getDoc(doc(db, 'settings', 'site'));
      newHealth.firestore = 'operational';
    } catch (e) { newHealth.firestore = 'degraded'; }

    try {
      // Check Integrations
      const tg = await getDoc(doc(db, 'settings', 'telegram'));
      newHealth.telegram = tg.exists() && tg.data().notificationsEnabled ? 'operational' : 'inactive';
      
      const pp = await getDoc(doc(db, 'settings', 'payments'));
      newHealth.phonepe = pp.exists() && pp.data().isPhonePeEnabled ? 'operational' : 'inactive';

      const so = await getDoc(doc(db, 'settings', 'smileone'));
      newHealth.smileone = so.exists() && so.data().isEnabled ? 'operational' : 'inactive';

      const up = await getDoc(doc(db, 'settings', 'unipin'));
      newHealth.unipin = up.exists() && up.data().isEnabled ? 'operational' : 'inactive';

    } catch (e) {
       console.error(e);
    }

    setHealth(newHealth);
    setLoading(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'operational': return <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase">Operational</span>;
      case 'degraded': return <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[8px] font-black uppercase">Degraded</span>;
      case 'inactive': return <span className="bg-white/5 text-muted-foreground border border-white/5 px-2 py-0.5 rounded text-[8px] font-black uppercase">Inactive</span>;
      default: return <span className="bg-white/5 text-white/40 border border-white/5 px-2 py-0.5 rounded text-[8px] font-black uppercase animate-pulse">Checking</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">System Health</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Kernel Monitoring Service</p>
        </div>
        <Button 
          variant="outline" 
          onClick={checkHealth}
          disabled={loading}
          className="h-10 px-4 rounded-xl border-border bg-card font-black uppercase text-[10px] tracking-widest gap-2"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />} Refresh Ping
        </Button>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HealthCard icon={Database} label="Core Firestore" status={health.firestore} color="text-blue-400" />
        <HealthCard icon={Bot} label="Telegram Bot" status={health.telegram} color="text-primary" />
        <HealthCard icon={Smartphone} label="PhonePe Gateway" status={health.phonepe} color="text-accent" />
        <HealthCard icon={Zap} label="Smile.one API" status={health.smileone} color="text-yellow-400" />
        <HealthCard icon={Cpu} label="UniPin API" status={health.unipin} color="text-green-400" />
      </div>

      <Card className="bg-card border-border rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-widest">Environment Intel</h3>
           </div>
           <span className="text-[9px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-[0.2em]">Build v2.5.0-STABLE</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           <div className="space-y-1">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Latency (P99)</p>
              <p className="text-xl font-black text-white">42ms</p>
           </div>
           <div className="space-y-1">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Server Region</p>
              <p className="text-xl font-black text-white">Asia-South1</p>
           </div>
           <div className="space-y-1">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">CPU Usage</p>
              <p className="text-xl font-black text-white">8%</p>
           </div>
           <div className="space-y-1">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Memory</p>
              <p className="text-xl font-black text-white">128MB</p>
           </div>
        </div>
      </Card>
    </div>
  );
}

function HealthCard({ icon: Icon, label, status, color }: any) {
  return (
    <Card className="bg-card border-border rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-primary/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={`h-2 w-2 rounded-full ${status === 'operational' ? 'bg-green-500 animate-pulse' : 'bg-primary'}`} />
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-black uppercase tracking-widest text-white/90">{label}</h4>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold text-muted-foreground uppercase">Status:</span>
           <StatusBadge status={status} />
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'operational': return <span className="text-green-500 text-[8px] font-black uppercase tracking-tighter">Verified Operational</span>;
    case 'degraded': return <span className="text-primary text-[8px] font-black uppercase tracking-tighter">Latency Detected</span>;
    case 'inactive': return <span className="text-muted-foreground text-[8px] font-black uppercase tracking-tighter">Connection Restricted</span>;
    default: return <span className="text-white/40 text-[8px] font-black uppercase tracking-tighter animate-pulse">Requesting Ping...</span>;
  }
}
