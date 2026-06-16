
'use client';

import { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Search, Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Loader2, Edit3, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminWalletRegistryPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustingWallet, setAdjustingWallet] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [saving, setSaving] = useState(false);

  // MEMOIZE COLLECTION TO PREVENT LOOPS
  const walletsRef = useMemo(() => collection(db, 'wallets'), [db]);
  const { data: wallets, loading } = useCollection(walletsRef);

  const filteredWallets = useMemo(() => {
    if (!wallets) return [];
    return wallets.filter(w => w.userId?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [wallets, searchQuery]);

  const handleAdjust = async () => {
    if (!adjustingWallet || !adjustAmount) return;
    setSaving(true);
    try {
      const wRef = doc(db, 'wallets', adjustingWallet.userId);
      await updateDoc(wRef, { 
        balance: increment(Number(adjustAmount)),
        updatedAt: new Date().toISOString()
      });
      toast({ title: 'Wallet Balanced', description: `Adjusted by ₹${adjustAmount} successfully.` });
      setAdjustingWallet(null);
      setAdjustAmount('');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Adjustment Failed', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Wallet Registry</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">HUB Credit Ledger</p>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search by User UID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border pl-12 h-14 rounded-2xl text-xs font-bold focus:border-primary shadow-xl"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
      ) : filteredWallets.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[2rem] p-20 text-center">
          <Wallet className="mx-auto h-10 w-10 text-muted-foreground opacity-20 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No Wallets Found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWallets.map((w) => (
            <Card key={w.userId} className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl group hover:border-primary/20 transition-all">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Wallet size={20} /></div>
                    <div>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">User Identity</p>
                      <p className="text-[10px] font-black uppercase text-white truncate max-w-[120px]">{w.userId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-white">₹{w.balance.toLocaleString()}</p>
                    <span className="text-[7px] font-black uppercase tracking-widest text-green-500">Available Credits</span>
                  </div>
                </div>
                <Button onClick={() => setAdjustingWallet(w)} className="w-full h-10 bg-white/5 border border-white/5 hover:bg-primary hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest gap-2">
                  <TrendingUp size={12} /> Adjust Balance
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!adjustingWallet} onOpenChange={() => setAdjustingWallet(null)}>
        <DialogContent className="bg-card border-border rounded-3xl p-8 max-w-sm">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-tighter">Balance Correction</DialogTitle></DialogHeader>
          <div className="py-6 space-y-4">
             <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Adjustment Amount (₹)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 500 or -500" 
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="bg-black/50 border-border h-14 rounded-2xl text-xl font-black text-primary px-6"
                />
                <p className="text-[8px] text-muted-foreground uppercase font-black">Use negative value to deduct funds from wallet.</p>
             </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdjust} disabled={saving} className="w-full bg-primary h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
              {saving ? <Loader2 className="animate-spin" /> : "Authorize Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
