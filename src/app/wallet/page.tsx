'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, query, collection, where, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, History, ArrowUpRight, ArrowDownLeft, Loader2, ArrowLeft, Crown, Target, Zap, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RankAvatar } from '@/components/ui/rank-avatar';
import { getRankFromSpend, DEFAULT_RANKS, type RankDefinition } from '@/lib/ranks';
import { RankProgressionSlider } from '@/components/wallet/rank-progression-slider';

export default function WalletDashboard() {
  const { user, profile, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);

  // Performance Trace
  useEffect(() => {
    if (window.__nav_click_time) {
      console.log(`[NAV_TRACE] Route "/wallet" loaded in ${(performance.now() - window.__nav_click_time).toFixed(2)}ms`);
      window.__nav_click_time = undefined;
    }
  }, []);

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

  // Dynamic Ranks from Admin (Fallback to Default)
  const ranksQuery = useMemo(() => query(collection(db, 'ranks'), orderBy('sortOrder', 'asc')), [db]);
  const { data: dbRanks } = useCollection<RankDefinition>(ranksQuery);
  const activeRanks = dbRanks && dbRanks.length > 0 ? dbRanks : DEFAULT_RANKS;

  const rankInfo = useMemo(() => {
    return getRankFromSpend(lifetimeSpend, activeRanks);
  }, [lifetimeSpend, activeRanks]);

  const getCardTheme = (rankName: string) => {
    const name = rankName.toLowerCase();
    const baseAatmaBg = 'bg-gradient-to-br from-red-900 via-zinc-950 to-black';
    
    if (name.includes('immortal')) return {
      bg: 'bg-gradient-to-br from-yellow-600 via-red-900 to-yellow-700 animate-pulse',
      border: 'border-yellow-400/50 shadow-[0_0_25px_rgba(234,179,8,0.3)]',
      shine: 'via-white/30',
    };
    
    // Warrior logic
    if (name.includes('warrior')) return {
      bg: baseAatmaBg,
      border: 'border-slate-400/40',
      shine: 'via-white/5',
    };

    return {
      bg: baseAatmaBg,
      border: `border-[${rankInfo.color}]/40 shadow-[0_0_10px_${rankInfo.color}33]`,
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
    <div id="rank-center" className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700 pb-20">
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
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none text-white">Wallet</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Manage your balance and transactions</p>
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
            "absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[1.375rem] overflow-hidden shadow-2xl border",
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
                {/* Floating Rank Badge Top-Right */}
                <div className={cn(
                  "backdrop-blur-md border px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-xl bg-black/40 shrink-0 text-white metallic-badge",
                  cardTheme.border
                )}>
                   <Crown size={8} className="fill-white/20 text-white" />
                   <span className="text-[8px] font-black uppercase tracking-widest">{rankInfo.name}</span>
                </div>
              </div>

              {/* CLEAN CENTER AREA */}
              <div className="flex-1" />

              <div className="mt-auto space-y-4">
                 <div className="flex justify-between items-end gap-4">
                    <div className="space-y-1.5 min-w-0">
                       <p className="text-base font-black text-white uppercase tracking-tight leading-none truncate">{profile?.fullName || 'AATMA OPERATOR'}</p>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: rankInfo.color }}>{rankInfo.name}</p>
                    </div>
                 </div>
                 <div className="flex justify-between items-center text-[7px] font-black uppercase text-white/30 border-t border-white/5 pt-3.5 gap-2">
                   <span className="shrink-0">Reward: <span className="text-green-500/60">{rankInfo.discount}% OFF</span></span>
                   <span className="shrink-0">Spent: <span className="text-white/60">₹{lifetimeSpend.toLocaleString()}</span></span>
                 </div>
              </div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className={cn(
            "absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[1.375rem] overflow-hidden shadow-2xl border",
            cardTheme.bg,
            cardTheme.border
          )}>
            <div className="relative h-full flex flex-col z-10">
              <div className="w-full h-10 bg-black/60 mt-6 shadow-inner shrink-0" />
              <div className="flex-1 px-6 flex flex-col justify-center gap-4">
                 <div className="text-center space-y-2.5 py-2">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Available Credits</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter leading-none truncate px-2">
                      ₹{balance.toLocaleString()}<span className="text-lg text-white/40">.00</span>
                    </h2>
                 </div>
              </div>
              <div className="p-4 border-t border-white/5 bg-black/40 flex justify-between items-center text-[7px] font-black uppercase text-white/30 tracking-widest mt-auto">
                 <span>Member ID: {user.uid.slice(-8).toUpperCase()}</span>
                 <span>Total Volume: ₹{lifetimeSpend.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/wallet/deposit" className="flex-1">
          <Button className="w-full h-16 bg-primary hover:bg-secondary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-primary/20 gap-3 group">
            <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform" /> Deposit
          </Button>
        </Link>
        <Link href="/wallet/history" className="flex-1">
          <Button variant="outline" className="w-full h-16 border-border bg-card text-white hover:bg-white/5 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all gap-3">
            <History className="h-5 w-5" /> Transaction History
          </Button>
        </Link>
      </div>

      {/* Advanced Rank Progression Slider (Horizontal Swipe) */}
      <RankProgressionSlider lifetimeSpend={lifetimeSpend} ranks={activeRanks} />

      {/* Recent Activity */}
      <div className="space-y-5">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Recent Activity</h3>
          <Link href="/wallet/history">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/30">View All</span>
          </Link>
        </div>
        
        <div className="space-y-3 pb-10">
          {transactionsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
          ) : recentTransactions.length === 0 ? (
            <div className="bg-card/20 border border-dashed border-border p-10 rounded-2xl text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No activity found</p>
            </div>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.transactionId} className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-lg hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center border",
                    tx.type === 'deposit' ? 'bg-green-500/10 border-green-500/10' : 'bg-primary/10 border-primary/10'
                  )}>
                    {tx.type === 'deposit' ? <ArrowDownLeft className="h-6 w-6 text-green-500" /> : <ArrowUpRight className="h-6 w-6 text-primary" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-white">{tx.type}</h4>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {tx.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-black", tx.type === 'deposit' ? 'text-green-400' : 'text-primary')}>
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
