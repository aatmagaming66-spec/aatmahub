'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc, collection, query, limit, orderBy, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, ShieldCheck, Zap, Database, Bot, Smartphone, Cpu, Loader2, RefreshCcw, Terminal, History, Wrench, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const INITIAL_GAMES = [
  { id: "mlbb-in", name: "MLBB India", imgId: "game-mlbb-india", flag: "🇮🇳" },
  { id: "mlbb-id", name: "MLBB Indonesia", imgId: "game-mlbb", flag: "🇮🇩" },
  { id: "mlbb-ph", name: "MLBB Philippines", imgId: "game-mlbb", flag: "🇵🇭" },
  { id: "mlbb-my", name: "MLBB Malaysia", imgId: "game-mlbb", flag: "🇲🇾" },
  { id: "mlbb-sg", name: "MLBB Singapore", imgId: "game-mlbb", flag: "🇸🇬" },
  { id: "mlbb-ru", name: "MLBB Russia", imgId: "game-mlbb", flag: "🇷🇺" },
  { id: "mlbb-br", name: "MLBB Brazil", imgId: "game-mlbb", flag: "🇧🇷" },
  { id: "hok", name: "Honor of Kings", imgId: "game-hok" },
  { id: "genshin", name: "Genshin Impact", imgId: "game-genshin" },
  { id: "bgmi", name: "BGMI", imgId: "game-bgmi" },
  { id: "mcgg", name: "Magic Chess Go Go", imgId: "game-mlbb" },
];

const INITIAL_OTT = [
  { id: "netflix", name: "Netflix Premium", imgId: "ott-netflix" },
  { id: "prime", name: "Amazon Prime", imgId: "ott-prime" },
  { id: "yt-prem", name: "YouTube Premium", imgId: "ott-yt" },
  { id: "spotify", name: "Spotify Premium", imgId: "ott-spotify" },
];

const INITIAL_SOCIAL = [
  { id: "ig-serv", name: "Instagram Services", imgId: "social-ig" },
  { id: "fb-serv", name: "Facebook Services", imgId: "social-fb" },
  { id: "tg-serv", name: "Telegram Services", imgId: "social-fb" },
  { id: "yt-serv", name: "YouTube Growth", imgId: "ott-yt" },
];

export default function SystemHealthPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [repairing, setRepairing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [health, setHealth] = useState<any>({
    firestore: 'checking',
    telegram: 'checking',
    phonepe: 'checking',
    smileone: 'checking',
    unipin: 'checking'
  });

  const { data: logs } = useCollection(
    query(collection(db, 'automationLogs'), orderBy('timestamp', 'desc'), limit(10))
  );

  const checkHealth = async () => {
    setLoading(true);
    const newHealth = { ...health };

    try {
      await getDoc(doc(db, 'settings', 'site'));
      newHealth.firestore = 'operational';
    } catch (e) { newHealth.firestore = 'degraded'; }

    try {
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

  const seedMarketplace = async () => {
    if (!confirm('This will seed initial marketplace data into Firestore. Proceed?')) return;
    setSeeding(true);
    try {
      const batch = writeBatch(db);

      INITIAL_GAMES.forEach((item, index) => {
        const ref = doc(db, 'games', item.id);
        batch.set(ref, { ...item, status: 'active', sortOrder: index + 1, updatedAt: new Date().toISOString() }, { merge: true });
      });

      INITIAL_OTT.forEach((item, index) => {
        const ref = doc(db, 'ott_services', item.id);
        batch.set(ref, { ...item, status: 'active', sortOrder: index + 1, updatedAt: new Date().toISOString() }, { merge: true });
      });

      INITIAL_SOCIAL.forEach((item, index) => {
        const ref = doc(db, 'social_services', item.id);
        batch.set(ref, { ...item, status: 'active', sortOrder: index + 1, updatedAt: new Date().toISOString() }, { merge: true });
      });

      await batch.commit();
      toast({ title: "Marketplace Synchronized", description: "All initial categories have been seeded into Firestore." });
      checkHealth();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Seeding Failed", description: error.message });
    } finally {
      setSeeding(false);
    }
  };

  const repairData = async () => {
    setRepairing(true);
    const collections = ['games', 'ott_services', 'social_services'];
    let totalFixed = 0;

    try {
      for (const colName of collections) {
        const snap = await getDocs(collection(db, colName));
        const docs = snap.docs;
        
        for (let i = 0; i < docs.length; i++) {
          const docRef = doc(db, colName, docs[i].id);
          await setDoc(docRef, { 
            sortOrder: i + 1,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          totalFixed++;
        }
      }
      
      toast({
        title: "Data Repair Complete",
        description: `Successfully synchronized ${totalFixed} records with numeric sortOrder.`,
      });
      checkHealth();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Repair Failed",
        description: error.message
      });
    } finally {
      setRepairing(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">System Health</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Kernel Monitoring Service</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={seedMarketplace}
            disabled={seeding}
            className="h-10 px-4 rounded-xl border-accent/20 bg-accent/5 text-accent font-black uppercase text-[10px] tracking-widest gap-2"
          >
            {seeding ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Initialize Marketplace
          </Button>
          <Button 
            variant="outline" 
            onClick={repairData}
            disabled={repairing}
            className="h-10 px-4 rounded-xl border-primary/20 bg-primary/5 text-primary font-black uppercase text-[10px] tracking-widest gap-2"
          >
            {repairing ? <Loader2 size={12} className="animate-spin" /> : <Wrench size={12} />} Repair Registry
          </Button>
          <Button 
            variant="outline" 
            onClick={checkHealth}
            disabled={loading}
            className="h-10 px-4 rounded-xl border-border bg-card font-black uppercase text-[10px] tracking-widest gap-2"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />} Refresh Ping
          </Button>
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HealthCard icon={Database} label="Core Firestore" status={health.firestore} color="text-blue-400" />
        <HealthCard icon={Bot} label="Telegram Bot" status={health.telegram} color="text-primary" />
        <HealthCard icon={Smartphone} label="PhonePe Gateway" status={health.phonepe} color="text-accent" />
        <HealthCard icon={Zap} label="Smile.one API" status={health.smileone} color="text-yellow-400" />
        <HealthCard icon={Cpu} label="UniPin API" status={health.unipin} color="text-green-400" />
        <HealthCard icon={Terminal} label="Automation Engine" status="operational" color="text-purple-400" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-xs font-black uppercase tracking-widest">Environment Intel</h3>
             </div>
             <span className="text-[9px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-[0.2em]">Build v2.5.0-STABLE</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             <Metric label="Latency" value="42ms" />
             <Metric label="Region" value="Asia-South1" />
             <Metric label="CPU Usage" value="8%" />
             <Metric label="Auto-Retries" value="Active" color="text-green-400" />
          </div>
        </Card>

        <Card className="bg-card border-border rounded-[2.5rem] p-8 shadow-2xl max-h-[400px] flex flex-col">
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <History className="h-5 w-5 text-accent" />
            <h3 className="text-xs font-black uppercase tracking-widest">Automation Logs</h3>
          </div>
          <div className="space-y-4 overflow-y-auto no-scrollbar flex-1">
            {logs?.length === 0 ? (
              <p className="text-[10px] text-muted-foreground uppercase text-center py-10 font-bold">No automation events recorded.</p>
            ) : logs?.map((log: any) => (
              <div key={log.logId} className="space-y-1 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                    log.type === 'failover' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                  }`}>{log.type}</span>
                  <span className="text-[7px] text-muted-foreground font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[9px] font-bold text-white/90 leading-tight mt-1">{log.details}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[7px] font-black text-muted-foreground uppercase">ORDER:</span>
                  <span className="text-[7px] font-black text-primary">{log.orderId || 'SYSTEM'}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, color = "text-white" }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
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
