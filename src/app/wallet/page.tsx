
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, query, collection, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, TrendingUp, History, PlusCircle, ArrowUpRight, ArrowDownLeft, Loader2, ArrowLeft, Crown, Cpu, Target, Zap, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export default function WalletDashboard() {
  const { user, profile, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const walletRef = useMemo(() => user ? doc(db, 'wallets', user.uid) : null, [user, db]);
  const { data: wallet, loading: walletLoading } = useDoc(walletRef);

  const transactionsQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid)
    );
  }, [user, db]);

  const { data: rawTransactions, loading: transactionsLoading } = useCollection(transactionsQuery);

  const recentTransactions = useMemo(() => {
    if (!rawTransactions) return [];
    return [...rawTransactions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [rawTransactions]);

  const lifetimeSpend = useMemo(() => {
    if (!rawTransactions) return 0;
    return rawTransactions
      .filter(tx => tx.type === 'purchase' && tx.status === 'success')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  }, [rawTransactions]);

  const rankInfo = useMemo(() => {
    const RANKS = [
      { name: 'Warrior', threshold: 0, discount: 0 },
      { name: 'Elite', threshold: 500, discount: 0 },
      { name: 'Master', threshold: 1500, discount: 0 },
      { name: 'Grandmaster', threshold: 3000, discount: 0 },
      { name: 'Epic', threshold: 7500, discount: 0 },
      { name: 'Legend', threshold: 15000, discount: 0 },
      { name: 'Mythic', threshold: 30000, discount: 0 },
      { name: 'Mythical Honor', threshold: 50000, discount: 1 },
      { name: 'Mythical Glory', threshold: 75000, discount: 2 },
      { name: 'Mythical Immortal', threshold: 100000, discount: 3 },
    ];

    let currentIdx = 0;
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (lifetimeSpend >= RANKS[i].threshold) {
        currentIdx = i;
        break;
      }
    }

    const current = RANKS[currentIdx];
    const next = currentIdx < RANKS.length - 1 ? RANKS[currentIdx + 1] : null;
    
    let progress = 100;
    if (next) {
      progress = Math.min(100, Math.floor(((lifetimeSpend - current.threshold) / (next.threshold - current.threshold)) * 100));
    }

    return { ...current, next: next?.name || 'MAX RANK', nextThreshold: next?.threshold || current.threshold, progress };
  }, [lifetimeSpend]);

  if (userLoading || walletLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const balance = wallet?.balance || 0;

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="flex items-center gap-4 py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none">Wallet Hub</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Digital Assets & Credits</p>
        </div>
      </header>

      {/* PREMIUM DEBIT CARD - COMPACT REFINEMENT */}
      <div className="relative w-full aspect-[2.1/1] rounded-[2rem] overflow-hidden shadow-2xl group transition-transform duration-500 active:scale-95">
        {/* Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-[#8b0000]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-10" />
        
        {/* Card Elements */}
        <div className="relative h-full p-4 flex flex-col justify-between z-10">
          {/* Top Section */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="font-headline font-black text-base tracking-tighter text-white/90">AATMA HUB</span>
              <span className="text-[5px] font-black text-primary uppercase tracking-[0.4em]">Digital Banking Layer</span>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-lg flex items-center gap-1.5 shadow-2xl">
               <Crown size={8} className="text-primary fill-primary/20" />
               <span className="text-[7px] font-black uppercase text-white tracking-widest">{rankInfo.name}</span>
            </div>
          </div>

          {/* Center Section: Chip & Balance */}
          <div className="flex items-center gap-4">
             <div className="h-7 w-10 bg-gradient-to-br from-yellow-600 via-yellow-400 to-yellow-700 rounded-md relative overflow-hidden flex items-center justify-center border border-yellow-200/30 shadow-inner shrink-0">
                <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1 opacity-20">
                   {[...Array(9)].map((_, i) => <div key={i} className="border border-black/40 rounded-sm" />)}
                </div>
                <Cpu className="absolute h-4 w-4 text-black/20" />
             </div>
             
             <div className="space-y-0">
                <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.2em]">Available Credits</span>
                <h2 className="text-3xl font-black text-white tracking-tighter leading-none">
                  ₹{balance.toLocaleString()}<span className="text-lg text-white/40">.00</span>
                </h2>
             </div>
          </div>

          {/* Bottom Section - Identity & Compact Stats */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
               <div className="space-y-0.5">
                  <span className="text-[7px] font-black text-white/30 uppercase tracking-widest leading-none">Card Holder</span>
                  <p className="text-xs font-black text-white uppercase tracking-tight leading-none">{profile?.fullName || 'AATMA OPERATOR'}</p>
               </div>
               <div className="text-right space-y-0.5">
                  <span className="text-[7px] font-black text-white/30 uppercase tracking-widest leading-none">Member Since</span>
                  <p className="text-xs font-black text-white uppercase tracking-tight leading-none">
                    {new Date(profile?.createdAt || Date.now()).getFullYear()}
                  </p>
               </div>
            </div>
            
            {/* Compact Info Row */}
            <div className="flex justify-between items-center text-[6px] font-black uppercase text-white/20 tracking-widest pt-1.5 border-t border-white/5">
               <span>Rank: {rankInfo.name}</span>
               <span className="text-primary/60">Disc: {rankInfo.discount}%</span>
               <span>Spend: ₹{lifetimeSpend.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Animated Shine Overlay */}
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 z-20" />
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex gap-4">
        <Link href="/wallet/deposit" className="flex-1">
          <Button className="w-full h-16 bg-primary hover:bg-secondary text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl transition-all shadow-xl shadow-primary/20 gap-3 group">
            <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform" /> Deposit
          </Button>
        </Link>
        <Link href="/wallet/history" className="flex-1">
          <Button variant="outline" className="w-full h-16 border-border bg-card text-white hover:bg-white/5 font-black text-xs uppercase tracking-[0.2em] rounded-3xl transition-all gap-3">
            <History className="h-5 w-5" /> Statement
          </Button>
        </Link>
      </div>

      {/* OPERATIONS INTELLIGENCE (EXTRA DETAILS) */}
      <section className="space-y-5 pt-2">
        <div className="flex items-center gap-3 px-2">
           <div className="h-5 w-1 bg-accent rounded-full" />
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Operations Intelligence</h3>
        </div>

        <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl">
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                   <Target size={12} className="text-primary" />
                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Lifetime Spend</span>
                </div>
                <p className="text-2xl font-black text-white tracking-tighter">₹{lifetimeSpend.toLocaleString()}</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                   <Zap size={12} className="text-accent" />
                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Current Discount</span>
                </div>
                <p className="text-2xl font-black text-accent tracking-tighter">{rankInfo.discount}% OFF</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
               <div className="flex justify-between items-end">
                  <div className="space-y-1">
                     <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Next Rank: <span className="text-primary">{rankInfo.next}</span></span>
                     <p className="text-xs font-black text-white uppercase tracking-widest">Goal: ₹{rankInfo.nextThreshold.toLocaleString()}</p>
                  </div>
                  <span className="text-xl font-black text-primary tracking-tighter">{rankInfo.progress}%</span>
               </div>
               <div className="relative">
                  <Progress value={rankInfo.progress} className="h-3 bg-white/5 rounded-full" />
                  <div className="absolute inset-0 bg-primary/20 blur-md rounded-full pointer-events-none" style={{ width: `${rankInfo.progress}%` }} />
               </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* RECENT ACTIVITY */}
      <div className="space-y-5">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Activity Logs</h3>
          <Link href="/wallet/history">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/30">Sync All</span>
          </Link>
        </div>
        
        <div className="space-y-3 pb-10">
          {transactionsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="bg-card/20 border border-dashed border-border p-10 rounded-3xl text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No financial records found</p>
            </div>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.transactionId} className="bg-card border border-border p-5 rounded-3xl flex items-center justify-between group active:bg-white/5 transition-all shadow-lg hover:border-primary/30">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center border",
                    tx.type === 'deposit' ? 'bg-green-500/10 border-green-500/10' : 'bg-primary/10 border-primary/10'
                  )}>
                    {tx.type === 'deposit' ? (
                      <ArrowDownLeft className="h-6 w-6 text-green-500" />
                    ) : (
                      <ArrowUpRight className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight">{tx.type}</h4>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {tx.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-black",
                    tx.type === 'deposit' ? 'text-green-400' : 'text-primary'
                  )}>
                    {tx.type === 'deposit' ? '+' : '-'} ₹{tx.amount}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
