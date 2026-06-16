
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, query, collection, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, History, ArrowUpRight, ArrowDownLeft, Loader2, ArrowLeft, Crown, Cpu, Target, Zap, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { RankAvatar } from '@/components/ui/rank-avatar';
import { getRankFromSpend, getNextRank } from '@/lib/ranks';

export default function DashboardPage() {
  const { user, profile, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);

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
    const current = getRankFromSpend(lifetimeSpend);
    const next = getNextRank(lifetimeSpend);
    
    let progress = 100;
    if (next) {
      progress = Math.min(100, Math.floor(((lifetimeSpend - current.threshold) / (next.threshold - current.threshold)) * 100));
    }

    return { ...current, next: next?.name || 'MAX RANK', nextThreshold: next?.threshold || current.threshold, progress };
  }, [lifetimeSpend]);

  const getCardTheme = (rankName: string) => {
    const name = rankName.toLowerCase();
    
    // AATMA HUB SIGNATURE BASE (Crimson + Black)
    const baseAatmaBg = 'bg-gradient-to-br from-red-900 via-zinc-950 to-black';
    
    if (name.includes('immortal')) return {
      bg: 'bg-gradient-to-br from-yellow-600 via-red-900 to-yellow-700 animate-pulse',
      border: 'border-yellow-400/50 shadow-[0_0_25px_rgba(234,179,8,0.3)]',
      chip: 'from-yellow-400 via-yellow-200 to-yellow-500',
      shine: 'via-white/30',
    };
    
    if (name.includes('glory')) return {
      bg: 'bg-gradient-to-br from-red-600 via-zinc-950 to-red-900',
      border: 'border-yellow-600/40 shadow-[0_0_20px_rgba(220,38,38,0.4)]',
      chip: 'from-yellow-500 via-yellow-300 to-yellow-600',
      shine: 'via-white/20',
    };

    if (name.includes('honor')) return {
      bg: baseAatmaBg,
      border: 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]',
      chip: 'from-orange-400 via-orange-200 to-orange-500',
      shine: 'via-white/15',
    };

    if (name.includes('mythic')) return {
      bg: baseAatmaBg,
      border: 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
      chip: 'from-red-400 via-red-200 to-red-500',
      shine: 'via-white/15',
    };

    if (name.includes('legend')) return {
      bg: baseAatmaBg,
      border: 'border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]',
      chip: 'from-yellow-400 via-yellow-200 to-yellow-500',
      shine: 'via-white/15',
    };

    if (name.includes('epic')) return {
      bg: baseAatmaBg,
      border: 'border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.2)]',
      chip: 'from-pink-400 via-pink-200 to-pink-500',
      shine: 'via-white/10',
    };

    if (name.includes('grandmaster')) return {
      bg: baseAatmaBg,
      border: 'border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
      chip: 'from-purple-400 via-purple-200 to-purple-500',
      shine: 'via-white/10',
    };

    if (name.includes('master')) return {
      bg: baseAatmaBg,
      border: 'border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
      chip: 'from-blue-400 via-blue-200 to-blue-500',
      shine: 'via-white/10',
    };

    if (name.includes('elite')) return {
      bg: baseAatmaBg,
      border: 'border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
      chip: 'from-emerald-400 via-emerald-200 to-emerald-500',
      shine: 'via-white/10',
    };

    return { // Warrior / Default Signature
      bg: baseAatmaBg,
      border: 'border-zinc-500/40',
      chip: 'from-zinc-400 via-zinc-200 to-zinc-500',
      shine: 'via-white/5',
    };
  };

  const cardTheme = getCardTheme(rankInfo.name);

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
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none text-white">Wallet Hub</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Digital Assets & Credits</p>
        </div>
      </header>

      {/* 3D FLIPPING PREMIUM DEBIT CARD */}
      <div 
        className="w-full mb-10 [perspective:1000px] cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={cn(
          "relative w-full min-h-[220px] transition-all duration-700 [transform-style:preserve-3d]",
          isFlipped && "[transform:rotateY(180deg)]"
        )}>
          
          {/* FRONT SIDE */}
          <div className={cn(
            "absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[2rem] overflow-hidden shadow-2xl border",
            cardTheme.bg,
            cardTheme.border
          )}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
            
            <div className="relative h-full p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col min-w-0">
                  <span className="font-headline font-black text-sm sm:text-base tracking-tighter text-white uppercase truncate">AATMA HUB</span>
                  <span className="text-[5px] font-black text-white/50 uppercase tracking-[0.4em]">Digital Gaming Bank</span>
                </div>
                <div className={cn(
                  "backdrop-blur-md border px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl transition-colors duration-500 bg-black/20 shrink-0 text-white",
                  cardTheme.border
                )}>
                   <Crown size={8} className="fill-white/20 text-white" />
                   <span className="text-[8px] font-black uppercase tracking-widest">{rankInfo.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 py-4">
                <div className={cn(
                  "h-8 w-11 bg-gradient-to-br rounded-md relative overflow-hidden flex items-center justify-center border border-white/20 shadow-inner shrink-0",
                  cardTheme.chip
                )}>
                   <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1 opacity-20">
                      {[...Array(9)].map((_, i) => <div key={i} className="border border-black/40 rounded-sm" />)}
                   </div>
                   <Cpu className="absolute h-4 w-4 text-black/20" />
                </div>
                
                <RankAvatar 
                   src={`https://picsum.photos/seed/${user.uid}/100/100`}
                   rank={rankInfo.name}
                   size="sm"
                />
              </div>

              <div className="mt-auto space-y-3">
                 <div className="flex justify-between items-end gap-4">
                    <div className="space-y-1 min-w-0">
                       <span className="text-[7px] font-black text-white/30 uppercase tracking-widest leading-none">Card Holder</span>
                       <p className="text-[10px] font-black text-white uppercase tracking-tight leading-none truncate">{profile?.fullName || 'AATMA OPERATOR'}</p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className="text-[9px] font-mono font-black text-white/40 tracking-[0.2em]">**** **** **** 2047</p>
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-center text-[7px] font-black uppercase text-white/30 border-t border-white/5 pt-2.5 gap-2 overflow-hidden">
                   <span className="truncate">Rank: <span className="text-white/60">{rankInfo.name}</span></span>
                   <span className="shrink-0">Discount: <span className="text-green-500/60">{rankInfo.discount}%</span></span>
                   <span className="shrink-0">Total: <span className="text-white/60">₹{lifetimeSpend.toLocaleString()}</span></span>
                 </div>
              </div>
            </div>
            <div className={cn(
              "absolute inset-0 translate-x-[-100%] hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent to-transparent -skew-x-12 z-20",
              cardTheme.shine
            )} />
          </div>

          {/* BACK SIDE */}
          <div className={cn(
            "absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[2rem] overflow-hidden shadow-2xl border",
            cardTheme.bg,
            cardTheme.border
          )}>
            <div className="relative h-full flex flex-col z-10">
              <div className="w-full h-10 bg-black/60 mt-6 shadow-inner shrink-0" />
              
              <div className="flex-1 px-6 flex flex-col justify-center gap-4">
                 <div className="flex items-center gap-4 shrink-0">
                    <div className="flex-1 h-6 bg-white/10 rounded flex items-center px-3 border border-white/5 overflow-hidden">
                       <span className="text-[6px] font-black text-white/20 uppercase truncate">Signature Area Unauthorized Copy Prohibited</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-2.5 py-1 rounded text-[8px] font-black text-white/60 shrink-0">247</div>
                 </div>

                 <div className="text-center space-y-1.5 py-2">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Available Credits</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter leading-none truncate px-2">
                      ₹{balance.toLocaleString()}<span className="text-lg text-white/40">.00</span>
                    </h2>
                 </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-black/40 flex justify-between items-center text-[7px] font-black uppercase text-white/30 tracking-widest mt-auto gap-2">
                 <span className="truncate">Tier: <span className="text-white/60">{rankInfo.name}</span></span>
                 <span className="shrink-0">Rewards: <span className="text-green-500/60">{rankInfo.discount}%</span></span>
                 <span className="shrink-0">Lifetime: <span className="text-white/60">₹{lifetimeSpend.toLocaleString()}</span></span>
              </div>
            </div>
          </div>

        </div>
      </div>

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

      <section className="space-y-5 pt-2">
        <div className="flex items-center gap-3 px-2">
           <div className="h-5 w-1 bg-accent rounded-full" />
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Operations Intelligence</h3>
        </div>

        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
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
                    <h4 className="text-sm font-black uppercase tracking-tight text-white">{tx.type}</h4>
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
