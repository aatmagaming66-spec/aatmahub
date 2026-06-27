'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Database, ShieldCheck, History, Loader2, FileJson, Vault } from 'lucide-react';

export default function BackupsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const exportData = async (colName: string) => {
    setExporting(true);
    try {
      const snap = await getDocs(collection(db, colName));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aatma-hub-${colName}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export Successful", description: `${colName.toUpperCase()} data exported.` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: "Export Failed", description: e.message });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Data Backups</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Export and Secure System Data</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border bg-black/20">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-white">
              <Vault className="h-4 w-4 text-primary" /> Export Data
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-4">Select collection to export as JSON:</p>
            <div className="grid grid-cols-2 gap-4">
               {['orders', 'users', 'transactions', 'wallets', 'products', 'games'].map((col) => (
                 <Button 
                   key={col}
                   variant="outline" 
                   onClick={() => exportData(col)}
                   disabled={exporting}
                   className="h-16 rounded-2xl border-border bg-black/20 hover:bg-primary hover:text-white transition-all flex flex-col gap-1 items-center justify-center"
                 >
                   <FileJson size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest">{col}</span>
                 </Button>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border bg-black/20">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-white">
              <ShieldCheck className="h-4 w-4 text-accent" /> Security Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Data Export</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
                Exported files contain raw site data. Store these files securely offline. These exports are meant for manual record keeping.
              </p>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
              <History className="h-5 w-5 text-muted-foreground opacity-40" />
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Backup Frequency</p>
                <p className="text-[10px] font-black text-white uppercase tracking-tighter">Manual Export (On-Demand)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
