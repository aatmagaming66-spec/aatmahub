'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc, collection, query, limit, orderBy, setDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Loader2, History, ShieldCheck, Zap, Globe, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function SystemSettingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [health, setHealth] = useState<any>({ firestore: 'checking' });
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance.',
    contactWhatsApp: '+91 8566936666',
    contactEmail: 'shivatetz@gmail.com',
    contactTelegram: '@aatmaplays',
    siteBranding: 'AATMA HUB'
  });

  const logsQuery = useMemo(() => query(collection(db, 'automationLogs'), orderBy('timestamp', 'desc'), limit(10)), [db]);
  const { data: logs } = useCollection(logsQuery);

  useEffect(() => {
    async function init() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'site'));
        if (snap.exists()) setSettings(prev => ({ ...prev, ...snap.data() }));
        
        setHealth({
          firestore: 'operational'
        });
      } catch (e) { console.error(e); setHealth({ firestore: 'degraded' }); }
      finally { setLoading(false); }
    }
    init();
  }, [db]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'site'), { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
      toast({ title: "Protocol Updated", description: "Global settings synchronized." });
    } catch (e: any) { toast({ variant: 'destructive', title: "Save Failed", description: e.message }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase text-white">System Settings</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">System Core & General Config</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary h-12 px-8 rounded-none font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 gap-2">
           {saving ? <Loader2 className="animate-spin" /> : <><Zap size={14} /> Commit Changes</>}
        </Button>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <HealthCard icon={Database} label="Core Firestore" status={health.firestore} color="text-blue-400" />
          <HealthCard icon={ShieldCheck} label="Identity Registry" status="operational" color="text-green-400" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-card border-border rounded-none overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border bg-black/20">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-white"><Globe className="h-4 w-4 text-primary" /> Core Protocol</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-none border border-white/5">
              <div className="space-y-0.5"><Label className="text-xs font-black uppercase">Maintenance Mode</Label><p className="text-[8px] text-muted-foreground uppercase font-black">Disable public marketplace access</p></div>
              <Switch checked={settings.maintenanceMode} onCheckedChange={(val) => setSettings({...settings, maintenanceMode: val})} className="data-[state=checked]:bg-primary" />
            </div>
            <div className="space-y-2"><Label className="text-[9px] font-black uppercase text-muted-foreground">Maintenance Message</Label><Input value={settings.maintenanceMessage} onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})} className="bg-black/50 border-border h-12 rounded-none font-bold" /></div>
            <div className="space-y-2"><Label className="text-[9px] font-black uppercase text-muted-foreground">Site Branding</Label><Input value={settings.siteBranding} onChange={(e) => setSettings({...settings, siteBranding: e.target.value})} className="bg-black/50 border-border h-12 rounded-none font-bold" /></div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-none overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border bg-black/20">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-white"><MessageCircle className="h-4 w-4 text-accent" /> Support Identity</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2"><Label className="text-[9px] font-black uppercase text-muted-foreground">WhatsApp Support</Label><Input value={settings.contactWhatsApp} onChange={(e) => setSettings({...settings, contactWhatsApp: e.target.value})} className="bg-black/50 border-border h-12 rounded-none font-bold" /></div>
            <div className="space-y-2"><Label className="text-[9px] font-black uppercase text-muted-foreground">Telegram Handle</Label><Input value={settings.contactTelegram} onChange={(e) => setSettings({...settings, contactTelegram: e.target.value})} className="bg-black/50 border-border h-12 rounded-none font-bold" /></div>
            <div className="space-y-2"><Label className="text-[9px] font-black uppercase text-muted-foreground">Official Email</Label><Input value={settings.contactEmail} onChange={(e) => setSettings({...settings, contactEmail: e.target.value})} className="bg-black/50 border-border h-12 rounded-none font-bold" /></div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border rounded-none p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3"><History className="h-5 w-5 text-primary" /><h3 className="text-xs font-black uppercase tracking-widest text-white">System Kernel Logs</h3></div>
           <span className="text-[8px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase">Real-time Feed</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto no-scrollbar">
          {logs?.map((log: any) => (
            <div key={log.id} className="p-4 bg-white/5 rounded-none border border-white/5 flex flex-col gap-2">
               <div className="flex justify-between items-center"><span className="text-[8px] font-black uppercase px-2 py-0.5 bg-primary/20 text-primary rounded-md">{log.type}</span><span className="text-[7px] text-white/30 font-bold uppercase">{new Date(log.timestamp).toLocaleTimeString()}</span></div>
               <p className="text-[10px] font-bold text-white/70 leading-relaxed uppercase">{log.details}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function HealthCard({ icon: Icon, label, status, color }: any) {
  return (
    <Card className="bg-card border-border rounded-none p-6 shadow-xl relative overflow-hidden group hover:border-primary/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-10 w-10 rounded-none bg-white/5 flex items-center justify-center ${color}`}><Icon className="h-5 w-5" /></div>
        <span className={`h-2 w-2 rounded-full ${status === 'operational' ? 'bg-green-500 animate-pulse' : 'bg-primary'}`} />
      </div>
      <h4 className="text-xs font-black uppercase tracking-widest text-white/90">{label}</h4>
      <p className="text-green-500 text-[8px] font-black uppercase tracking-tighter mt-1">Status: {status}</p>
    </Card>
  );
}