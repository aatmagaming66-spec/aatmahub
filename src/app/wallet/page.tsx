'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, query, collection, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle, History, ArrowUpRight, ArrowDownLeft, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection } from '@/firebase/firestore/use-collection';

export default function WalletDashboard() {
  const { user, profile, initialized } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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

  const balance = wallet?.balance || 0;

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-300 pb-20 page-shell text-foreground">
      <header className="flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-white/5 active-press">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none text-white">My Wallet</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Manage your balance and transactions</p>
        </div>
      </header>

      <div className="w-full mb-6 [perspective:1200px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={cn("relative w-full min-h-[250px] transition-all duration-700 [transform-style:preserve-3d]", isFlipped && "[transform:rotateY(180deg)]")}>
          {/* FRONT */}
          <div className={cn(
            "absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[2rem] overflow-hidden shadow-3d border border-white/20 p-8 flex flex-col justify-between transition-all",
            "bg-gradient-to-br from-[#110000] via-[#dc2626] to-[#ec4899]"
          )}>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30 z-20" />
            <div className="flex justify-between items-start gap-4 relative z-10">
              <span className="font-headline font-black text-xl tracking-tighter text-white uppercase drop-shadow-2xl">AATMA HUB</span>
              <div className="backdrop-blur-xl border border-white/30 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-2xl bg-black/40 text-white">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/90">Wallet Active</span>
              </div>
            </div>
            <div className="mt-auto space-y-4 relative z-10">
              <div className="space-y-0.5">
                {!initialized || !profile ? (
                  <Skeleton className="h-6 w-40 bg-white/10" />
                ) : (
                  <p className="text-xl font-black text-white uppercase truncate drop-shadow-xl">{profile?.fullName || 'User Name'}</p>
                )}
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">Verified Member</p>
              </div>
              <div className="flex justify-between items-center text-[8px] font-black uppercase text-white/40 border-t border-white/10 pt-4">
                <span>Account: <span className="text-white">{user?.uid.substring(0, 10).toUpperCase()}</span></span>
              </div>
            </div>
          </div>
          {/* BACK */}
          <div className={cn(
            "absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[2rem] overflow-hidden shadow-3d border border-white/20 flex flex-col transition-all",
            "bg-gradient-to-br from-[#ec4899] via-[#dc2626] to-[#110000]"
          )}>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30 z-20" />
            <div className="w-full h-12 bg-black/60 mt-8 shadow-inner shrink-0" />
            <div className="flex-1 px-8 flex flex-col justify-center text-center space-y-2">
              <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">Total Balance</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter drop-shadow-2xl leading-none">
                {(!initialized || walletLoading) ? <Skeleton className="h-12 w-32 mx-auto bg-white/10" /> : `₹${balance.toLocaleString()}`}<span className="text-2xl text-white/60">.00</span>
              </h2>
            </div>
            <div className="p-6 border-t border-white/10 bg-black/40 flex justify-between items-center text-[8px] font-black uppercase text-white/40 tracking-widest mt-auto">
              <span>User ID: {user?.uid.slice(-12).toUpperCase() || '--------'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/wallet/deposit" className="flex-1" prefetch={false}>
          <Button className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-3d gap-3 border-t border-white/20">
            <PlusCircle size={20} /> Add Money
          </Button>
        </Link>
        <Link href="/wallet/history" className="flex-1" prefetch={false}>
          <Button variant="outline" className="w-full h-16 border-border bg-card text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-3d gap-3">
            <History size={20} /> History
          </Button>
        </Link>
      </div>

      <div className="space-y-5">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Recent Activity</h3>
          <Link href="/wallet/history" prefetch={false}><span className="text-[10px] font-black text-primary uppercase border-b border-primary/40 hover:text-white transition-colors">View All</span></Link>
        </div>
        <div className="space-y-4 pb-10">
          {(!initialized || transactionsLoading) ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl bg-card shadow-3d" />)
          ) : recentTransactions.length === 0 ? (
            <div className="bg-card/20 border border-dashed border-border p-12 rounded-[2rem] text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No transactions found</p>
            </div>
          ) : (
             recentTransactions.map((tx) => (
               <div key={tx.transactionId} className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-3d hover:border-primary/40 transition-all group active:scale-[0.99]">
                  <div className="flex items-center gap-5">
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border shadow-inner", tx.type === 'deposit' ? 'bg-green-500/10 border-green-500/10' : 'bg-primary/10 border-primary/20')}>
                      {tx.type === 'deposit' ? <ArrowDownLeft className="h-7 w-7 text-green-500" /> : <ArrowUpRight className="h-7 w-7 text-primary" />}
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase text-white leading-none mb-1.5">{tx.type}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        {isMounted ? new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '...'} • <span className={cn(tx.status === 'success' ? 'text-green-500/60' : 'text-orange-400/60')}>{tx.status}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-lg font-black tracking-tighter", tx.type === 'deposit' ? 'text-green-400' : 'text-primary')}>
                      {tx.type === 'deposit' ? '+' : '-'} ₹{tx.amount}
                    </p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mt-1">Transaction Log</p>
                  </div>
               </div>
             ))
          )}
        </div>
      </div>
    </div>
  );
}
