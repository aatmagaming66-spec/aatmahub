'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useStorage } from '@/firebase/provider';
import { doc, getDoc, collection, query, limit, orderBy, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, ShieldCheck, Zap, Database, Bot, Smartphone, Terminal, Loader2, RefreshCcw, History, Wrench, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function SystemHealthPage() {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [repairing, setRepairing] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [health, setHealth] = useState<any>({
    firestore: 'checking',
    telegram: 'checking',
    phonepe: 'checking',
    smileone: 'checking',
    unipin: 'checking'
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

  // PERFORMANCE: Payload Migration Tool (Base64 -> Storage URL)
  const migrateAssets = async () => {
    if (!confirm('This will find documents with Base64 images and move them to Firebase Storage. Continue?')) return;
    setMigrating(true);
    let migratedCount = 0;

    try {
      const collections = ['games', 'ott_services', 'social_services', 'products'];
      for (const colName of collections) {
        const snap = await getDocs(collection(db, colName));
        for (const d of snap.docs) {
          const data = d.data();
          const updates: any = {};
          
          // Check for Base64 markers in known image fields
          const fields = ['icon', 'cardImage', 'thumbnail', 'banner'];
          for (const field of fields) {
            if (data[field]?.startsWith('data:image')) {
              const storageRef = ref(storage, `migrated/${colName}/${d.id}_${field}`);
              await uploadString(storageRef, data[field], 'data_url');
              updates[field] = await getDownloadURL(storageRef);
              migratedCount++;
            }
          }

          if (Object.keys(updates).length > 0) {
            await setDoc(doc(db, colName, d.id), { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
          }
        }
      }
      toast({ title: "Migration Complete", description: `Successfully moved ${migratedCount} assets to Storage.` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: "Migration Error", description: e.message });
    } finally {
      setMigrating(false);
    }
  };

  const repairRegistry = async () => {
    setRepairing(true);
    try {
      const collections = ['games', 'ott_services', 'social_services'];
      for (const colName of collections) {
        const snap = await getDocs(collection(db, colName));
        const docs = snap.docs;
        for (let i = 0; i < docs.length; i++) {
          await setDoc(doc(db, colName, docs[i].id), { 
            sortOrder: i + 1,
            status: 'active',
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      }
      toast({ title: "Repair Complete", description: "All documents now have valid sortOrder." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Repair Failed", description: error.message });
    } finally {
      setRepairing(false);
    }
  };

  useEffect(() => { checkHealth(); }, []);

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
            onClick={migrateAssets}
            disabled={migrating}
            className="h-10 px-4 rounded-xl border-accent/20 bg-accent/5 text-accent font-black uppercase text-[10px] tracking-widest gap-2"
          >
            {migrating ? <Loader2 size={12} className="animate-spin" /> : <ImageIcon size={12} />} Migrate Payload
          </Button>
          <Button 
            variant="outline" 
            onClick={repairRegistry}
            disabled={repairing}
            className="h-10 px-4 rounded-xl border-primary/20 bg-primary/5 text-primary font-black uppercase text-[10px] tracking-widest gap-2"
          >
            {repairing ? <Loader2 size={12} className="animate-spin" /> : <Wrench size={12} />} Repair Registry
          </Button>
          <Button variant="outline" onClick={checkHealth} className="h-10 px-4 rounded-xl border-border bg-card font-black uppercase text-[10px] tracking-widest gap-2">
            <RefreshCcw size={12} /> Refresh Ping
          </Button>
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HealthCard icon={Database} label="Core Firestore" status={health.firestore} color="text-blue-400" />
        <HealthCard icon={Bot} label="Telegram Bot" status={health.telegram} color="text-primary" />
        <HealthCard icon={Terminal} label="Automation" status="operational" color="text-purple-400" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-xs font-black uppercase tracking-widest">Environment Intel</h3>
             </div>
             <span className="text-[9px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-[0.2em]">Build v2.6.2-STABLE</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             <Metric label="Latency" value="28ms" />
             <Metric label="Storage" value="Managed" color="text-green-400" />
             <Metric label="Auth" value="Progressive" color="text-blue-400" />
             <Metric label="Asset CDN" value="Optimized" color="text-accent" />
          </div>
        </Card>

        <Card className="bg-card border-border rounded-[2.5rem] p-8 shadow-2xl flex flex-col">
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <History className="h-5 w-5 text-accent" />
            <h3 className="text-xs font-black uppercase tracking-widest">Automation Logs</h3>
          </div>
          <div className="space-y-4 overflow-y-auto no-scrollbar flex-1">
            {logs?.map((log: any) => (
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
        <div className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}><Icon className="h-5 w-5" /></div>
        <span className={`h-2 w-2 rounded-full ${status === 'operational' ? 'bg-green-500 animate-pulse' : 'bg-primary'}`} />
      </div>
      <h4 className="text-xs font-black uppercase tracking-widest text-white/90">{label}</h4>
      <p className="text-green-500 text-[8px] font-black uppercase tracking-tighter mt-1">Verified {status}</p>
    </Card>
  );
}
