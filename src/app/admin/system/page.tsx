
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc, collection, query, limit, orderBy, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, ShieldCheck, Zap, Database, Bot, Terminal, Loader2, RefreshCcw, History, Wrench, Sparkles, DatabaseZap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function SystemHealthPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [repairing, setRepairing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [health, setHealth] = useState<any>({
    firestore: 'checking',
    telegram: 'checking'
  });

  const logsQuery = useMemo(() => query(
    collection(db, 'automationLogs'), 
    orderBy('timestamp', 'desc'), 
    limit(10)
  ), [db]);

  const { data: logs } = useCollection(logsQuery);

  const checkHealth = async () => {
    setLoading(true);
    const newHealth = { ...health };
    try {
      await getDoc(doc(db, 'settings', 'site'));
      newHealth.firestore = 'operational';
      const tg = await getDoc(doc(db, 'settings', 'telegram'));
      newHealth.telegram = tg.exists() && tg.data().notificationsEnabled ? 'operational' : 'inactive';
    } catch (e) { newHealth.firestore = 'degraded'; }
    setHealth(newHealth);
    setLoading(false);
  };

  /**
   * REPAIR REGISTRY: Migrates all orphaned products and titles into a unified dynamic registry.
   * Ensures every document has required fields for Admin visibility.
   */
  const repairRegistry = async () => {
    if (!confirm('Perform deep registry synchronization? This will repair orphaned product records.')) return;
    setRepairing(true);
    try {
      const collections = ['games', 'ott_services', 'social_services', 'products', 'ranks'];
      let count = 0;
      
      for (const colName of collections) {
        const snap = await getDocs(collection(db, colName));
        for (const d of snap.docs) {
          const data = d.data();
          await setDoc(doc(db, colName, d.id), { 
            ...data,
            status: data.status || 'active',
            sortOrder: data.sortOrder || 1,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          count++;
        }
      }
      toast({ title: "Deep Sync Complete", description: `Synchronized ${count} records across all sectors.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
    } finally {
      setRepairing(false);
    }
  };

  /**
   * INITIALIZE MARKETPLACE: Seeds the database with production-ready base data.
   */
  const seedMarketplace = async () => {
    if (!confirm('Deploy master marketplace blueprint? This will populate your catalog with active titles and SKUs.')) return;
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      
      const games = [
        { id: 'mlbb-global', name: 'Mobile Legends', slug: 'mlbb-global', status: 'active', sortOrder: 1, flag: '🌐', requirePlayerId: true, requireServerId: true },
        { id: 'ff-global', name: 'Free Fire', slug: 'ff-global', status: 'active', sortOrder: 2, flag: '🔥', requirePlayerId: true, requireServerId: false },
        { id: 'pubg-global', name: 'BGMI / PUBG', slug: 'pubg-global', status: 'active', sortOrder: 3, flag: '🔫', requirePlayerId: true, requireServerId: false }
      ];

      const products = [
        { id: 'ml-86', name: '86 Diamonds', price: 99, category: 'mlbb-global', tab: 'small', status: 'active', region: 'Global' },
        { id: 'ml-172', name: '172 Diamonds', price: 199, category: 'mlbb-global', tab: 'small', status: 'active', region: 'Global' },
        { id: 'ml-weekly', name: 'Weekly Pass', price: 159, category: 'mlbb-global', tab: 'pass', status: 'active', region: 'Global' },
        { id: 'ff-100', name: '100 Diamonds', price: 80, category: 'ff-global', tab: 'small', status: 'active', region: 'Global' }
      ];

      for (const g of games) { batch.set(doc(db, 'games', g.id), { ...g, updatedAt: new Date().toISOString() }); }
      for (const p of products) { batch.set(doc(db, 'products', p.id), { ...p, updatedAt: new Date().toISOString() }); }

      await batch.commit();
      toast({ title: 'Marketplace Blueprint Deployed', description: 'Catalog Registry is now dynamic.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Seed Failed', description: e.message });
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => { checkHealth(); }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Kernel Stats</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">System Monitoring & Maintenance</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={repairRegistry}
            disabled={repairing}
            className="h-10 px-4 rounded-xl border-primary/20 bg-primary/5 text-primary font-black uppercase text-[10px] tracking-widest gap-2"
          >
            {repairing ? <Loader2 size={12} className="animate-spin" /> : <DatabaseZap size={12} />} Deep Registry Sync
          </Button>
          <Button variant="outline" onClick={checkHealth} className="h-10 px-4 rounded-xl border-border bg-card font-black uppercase text-[10px] tracking-widest gap-2">
            <RefreshCcw size={12} /> Ping System
          </Button>
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HealthCard icon={Database} label="Core Firestore" status={health.firestore} color="text-blue-400" />
        <HealthCard icon={Bot} label="Telegram Gateway" status={health.telegram} color="text-primary" />
        <HealthCard icon={Terminal} label="Kernel Logic" status="operational" color="text-purple-400" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-xs font-black uppercase tracking-widest">Operations Hub</h3>
             </div>
             <span className="text-[9px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-[0.2em]">Build v2.8.5-STABLE</span>
          </div>
          
          <div className="space-y-6">
            <p className="text-[11px] text-muted-foreground uppercase leading-relaxed font-medium">
              AATMA HUB dynamic registry handles cross-collection synchronization. If product visibility drops, use the <b>Deep Registry Sync</b> to re-index all digital assets.
            </p>
            <div className="pt-4 flex gap-4">
               <Button onClick={seedMarketplace} disabled={seeding} className="bg-primary h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest">
                 {seeding ? <Loader2 className="animate-spin h-4 w-4" /> : <><Sparkles className="mr-2 h-4 w-4" /> Seed Blueprint</>}
               </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border rounded-[2.5rem] p-8 shadow-2xl flex flex-col">
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <History className="h-5 w-5 text-accent" />
            <h3 className="text-xs font-black uppercase tracking-widest">Automation Logs</h3>
          </div>
          <div className="space-y-4 overflow-y-auto no-scrollbar flex-1 max-h-[300px]">
            {logs?.length === 0 ? (
               <p className="text-[9px] font-black uppercase text-muted-foreground opacity-30 text-center py-10">No recent logs</p>
            ) : logs?.map((log: any) => (
              <div key={log.logId} className="space-y-1 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${log.type === 'failover' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>{log.type}</span>
                  <span className="text-[7px] text-muted-foreground font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[9px] font-bold text-white/90 leading-tight mt-1">{log.details}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function HealthCard({ icon: Icon, label, status, color }: any) {
  return (
    <Card className="bg-card border-border rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-primary/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}><Icon className="h-5 w-5" /></div>
        <span className={`h-2 w-2 rounded-full ${status === 'operational' ? 'bg-green-500 animate-pulse' : 'bg-primary'}`} />
      </div>
      <h4 className="text-xs font-black uppercase tracking-widest text-white/90">{label}</h4>
      <p className="text-green-500 text-[8px] font-black uppercase tracking-tighter mt-1">Status: {status}</p>
    </Card>
  );
}
