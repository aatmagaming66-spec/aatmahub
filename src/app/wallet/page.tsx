'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useGlobalSettings } from '@/firebase/settings-context';
import { doc, query, collection, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, History, ArrowUpRight, ArrowDownLeft, Loader2, ArrowLeft, Crown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getRankFromSpend, DEFAULT_RANKS } from '@/lib/ranks';
import { RankProgressionSlider } from '@/components/wallet/rank-progression-slider';
import { Skeleton } from '@/components/ui/skeleton';

export default function WalletDashboard() {
  const { user, profile, initialized } = useUser();
  const { ranks } = useGlobalSettings();
  const db = useFirestore();
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);

  // REDIRECT GATING - Moved into useEffect to allow shell render
  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [user, initialized, router]);

  const walletRef = useMemo(() => user ? doc(db, 'wallets', user.uid) : null, [user, db]);
  const { data: wallet, loading: walletLoading } = useDoc(walletRef);

  const transactionsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'transactions'), where('userId', '==', user.uid));
  }, [user, db]);

  const { data: rawTransactions, loading: transactionsLoading } = useCollection(transactionsQuery);

  const recentTransactions = useMemo(() => {
    if (!rawTransactions) return [];
    return [...rawTransactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [rawTransactions]);

  const rankInfo = useMemo(() => {
    return getRankFromSpend(profile?.lifetimeSpend || 0, ranks);
  }, [profile, ranks]);

  const getCardTheme = (rankName: string) => {
    const name = (rankName || 'Warrior').toLowerCase();
    if (name.includes('immortal') || name.includes('vip') || name.includes('legend')) return {
      bg: 'bg-gradient-to-br from-yellow-600 via-red-900 to-yellow-700 animate-pulse',
      border: 'border-yellow-400/50 shadow-[0_0_25px_rgba(234,179,8,0.3)]'
    };
    return { bg: 'bg-gradient-to-br from-red-900 via-zinc-950 to-black', border: 'border-slate-400/40' };
  };

  const theme = getCardTheme(rankInfo.name);

  const balance = wallet?.balance || 0;

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in pb-20">
      <header className="flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none text-white">Wallet</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Balance & Transactions</p>
        </div>
      </header>

      <div className="w-full mb-10 [perspective:1000px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={cn("relative w-full min-h-[220px] transition-all duration-700 [transform-style:preserve-3d]", isFlipped && "[transform:rotateY(180deg)]")}>
          {/* FRONT */}
          <div className={cn("absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[1.375rem] overflow-hidden shadow-2xl border p-6 flex flex-col justify-between", theme.bg, theme.border)}>
            <div className="flex justify-between items-start gap-4">
              <span className="font-headline font-black text-sm tracking-tighter text-white uppercase">AATMA HUB</span>
              <div className="backdrop-blur-md border border-white/20 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-xl bg-black/40 text-white">
                <Crown size={8} />
                <span className="text-[8px] font-black uppercase tracking-widest">{rankInfo.name}</span>
              </div>
            </div>
            <div className="mt-auto space-y-4">
              <div className="space-y-1.5">
                {!initialized ? <Skeleton className="h-5 w-32 bg-white/10" /> : (
                  <p className="text-base font-black text-white uppercase truncate">{profile?.fullName || 'AATMA OPERATOR'}</p>
                )}
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: rankInfo.color }}>{rankInfo.name}</p>
              </div>
              <div className="flex justify-between items-center text-[7px] font-black uppercase text-white/30 border-t border-white/5 pt-3.5">
                <span>Reward: <span className="text-green-500/60">{rankInfo.discount}% OFF</span></span>
                <span>Spent: <span className="text-white/60">₹{profile?.lifetimeSpend?.toLocaleString() || 0}</span></span>
              </div>
            </div>
          </div>
          {/* BACK */}
          <div className={cn("absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[1.375rem] overflow-hidden shadow-2xl border flex flex-col", theme.bg, theme.border)}>
            <div className="w-full h-10 bg-black/60 mt-6 shadow-inner" />
            <div className="flex-1 px-6 flex flex-col justify-center text-center space-y-2.5">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Available Credits</span>
              <h2 className="text-3xl font-black text-white tracking-tighter">
                {walletLoading ? <span className="animate-pulse opacity-50">...</span> : `₹${balance.toLocaleString()}`}<span className="text-lg text-white/40">.00</span>
              </h2>
            </div>
            <div className="p-4 border-t border-white/5 bg-black/40 flex justify-between items-center text-[7px] font-black uppercase text-white/30 tracking-widest">
              <span>Member ID: {user?.uid.slice(-8).toUpperCase() || '--------'}</span>
              <span>Total Volume: ₹{profile?.lifetimeSpend?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/wallet/deposit" className="flex-1">
          <Button className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl gap-3">
            <PlusCircle size={20} /> Deposit
          </Button>
        </Link>
        <Link href="/wallet/history" className="flex-1">
          <Button variant="outline" className="w-full h-16 border-border bg-card text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl gap-3">
            <History size={20} /> History
          </Button>
        </Link>
      </div>

      <RankProgressionSlider lifetimeSpend={profile?.lifetimeSpend || 0} ranks={ranks} />

      <div className="space-y-5">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Recent Activity</h3>
          <Link href="/wallet/history"><span className="text-[10px] font-black text-primary uppercase border-b border-primary/30">View All</span></Link>
        </div>
        <div className="space-y-3">
          {transactionsLoading || !initialized ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-card" />) :
           recentTransactions.length === 0 ? <div className="bg-card/20 border border-dashed border-border p-10 rounded-2xl text-center"><p className="text-[10px] font-black uppercase text-muted-foreground">No activity found</p></div> :
           recentTransactions.map((tx) => (
             <div key={tx.transactionId} className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border", tx.type === 'deposit' ? 'bg-green-500/10 border-green-500/10' : 'bg-primary/10 border-primary/10')}>
                    {tx.type === 'deposit' ? <ArrowDownLeft className="h-6 w-6 text-green-500" /> : <ArrowUpRight className="h-6 w-6 text-primary" />}
                  </div>
                  <div><h4 className="text-sm font-black uppercase text-white">{tx.type}</h4><p className="text-[9px] text-muted-foreground uppercase font-bold">{new Date(tx.createdAt).toLocaleDateString()} • {tx.status}</p></div>
                </div>
                <div className="text-right"><p className={cn("text-sm font-black", tx.type === 'deposit' ? 'text-green-400' : 'text-primary')}>{tx.type === 'deposit' ? '+' : '-'} ₹{tx.amount}</p></div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
