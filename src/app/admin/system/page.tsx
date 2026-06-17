'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc, collection, query, limit, orderBy, getDocs, setDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, ShieldCheck, Database, Bot, Terminal, Loader2, DatabaseZap, History, Zap, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function SystemHealthPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
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
   * INITIALIZE REGISTRY METADATA
   * Scans Games, OTT, and Social collections to ensure base records exist in media_assets.
   * Does NOT sync images (manual upload only) to prevent blob URL pollution.
   */
  const initializeRegistryMetadata = async () => {
    if (!confirm('Re-initialize Media Registry metadata? This will detect new services but will not overwrite existing images.')) return;
    setProcessing(true);
    try {
      const types = [
        { col: 'games', type: 'game' },
        { col: 'ott_services', type: 'ott' },
        { col: 'social_services', type: 'social' }
      ];
      
      let created = 0;
      let existing = 0;

      for (const t of types) {
        const snap = await getDocs(collection(db, t.col));
        for (const d of snap.docs) {
          const data = d.data();
          const registryRef = doc(db, 'media_assets', d.id);
          const registrySnap = await getDoc(registryRef);

          if (!registrySnap.exists()) {
            const metaData = {
              entityId: d.id,
              entityType: t.type,
              entityName: data.name || d.id,
              updatedAt: new Date().toISOString()
            };
            await setDoc(registryRef, metaData);
            created++;
          } else {
            existing++;
          }
        }
      }
      
      toast({ 
        title: "Registry Handshake Complete", 
        description: `Registered ${created} new entities. ${existing} already in vault.` 
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Init Failed", description: error.message });
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => { checkHealth(); }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase text-white">Kernel Stats</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">System Core Control</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={initializeRegistryMetadata} 
            disabled={processing} 
            className="h-10 px-4 rounded-xl border-primary/20 bg-primary/5 text-primary font-black uppercase text-[9px] tracking-widest gap-2"
          >
            {processing ? <Loader2 size={12} className="animate-spin" /> : <Layers size={12} />} 
            Initialize Registry Metadata
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
             <span className="text-[9px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-[0.2em]">Build v4.0.0-MEDIA-HUB</span>
          </div>
          
          <div className="space-y-6">
            <p className="text-[11px] text-muted-foreground uppercase leading-relaxed font-medium">
              The Cloud Asset Registry is now online. This system operates on a direct-upload protocol, bypassing legacy record scraping to ensure 100% persistent HTTPS image delivery.
              <br/><br/>
              <b>Registry State:</b> Use the "Initialize Registry Metadata" tool above to scan your catalog and prepare the Media Hub for manual uploads.
            </p>
          </div>
        </Card>

        <Card className="bg-card border-border rounded-[2.5rem] p-8 shadow-2xl flex flex-col">
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <History className="h-5 w-5 text-accent" />
            <h3 className="text-xs font-black uppercase tracking-widest">System Logs</h3>
          </div>
          <div className="space-y-4 overflow-y-auto no-scrollbar flex-1 max-h-[300px]">
            {logs?.length === 0 ? (
               <p className="text-[9px] font-black uppercase text-muted-foreground opacity-30 text-center py-10">No recent logs</p>
            ) : logs?.map((log: any) => (
              <div key={log.id || log.logId} className="space-y-1 p-3 bg-white/5 rounded-xl border border-white/5">
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
