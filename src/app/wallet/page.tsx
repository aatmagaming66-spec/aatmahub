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
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-none hover:bg-white/5">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none text-white">My Wallet</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Manage your balance and transactions</p>
        </div>
      </header>

      <div className="w-full mb-6 [perspective:1000px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={cn("relative w-full min-h-[250px] transition-all duration-700 [transform-style:preserve-3d]", isFlipped && "[transform:rotateY(180deg)]")}>
          {/* FRONT */}
          <div className={cn("absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[1.375rem] overflow-hidden shadow-2xl border p-7 flex flex-col justify-between bg-gradient-to-br from-[#110000] via-[#dc2626] to-[#ec4899] border-white/20")}>
            <div className="flex justify-between items-start gap-4 relative z-10">
              <span className="font-headline font-black text-sm tracking-tighter text-white uppercase drop-shadow-md">AATMA HUB</span>
              <div className="backdrop-blur-md border border-white/20 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-xl bg-black/40 text-white">
                <span className="text-[8px] font-black uppercase tracking-widest">Wallet Active</span>
              </div>
            </div>
            <div className="mt-auto space-y-3 relative z-10">
              <div className="space-y-0.5">
                {!initialized || !profile ? (
                  <Skeleton className="h-5 w-32 bg-white/10" />
                ) : (
                  <p className="text-sm font-black text-white uppercase truncate drop-shadow-sm">{profile?.fullName || 'User Name'}</p>
                )}
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50">Verified Member</p>
              </div>
              <div className="flex justify-between items-center text-[7px] font-black uppercase text-white/40 border-t border-white/10 pt-3">
                <span>Account: <span className="text-white">{user?.uid.substring(0, 10).toUpperCase()}</span></span>
              </div>
            </div>
          </div>
          {/* BACK */}
          <div className={cn("absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[1.375rem] overflow-hidden shadow-2xl border flex flex-col bg-gradient-to-br from-[#ec4899] via-[#dc2626] to-[#110000] border-white/20")}>
            <div className="w-full h-10 bg-black/60 mt-6 shadow-inner shrink-0" />
            <div className="flex-1 px-6 flex flex-col justify-center text-center space-y-2">
              <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em]">Total Balance</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter drop-shadow-lg leading-none">
                {(!initialized || walletLoading) ? <Skeleton className="h-10 w-24 mx-auto bg-white/10" /> : `₹${balance.toLocaleString()}`}<span className="text-lg text-white/60">.00</span>
              </h2>
            </div>
            <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center text-[7px] font-black uppercase text-white/40 tracking-widest mt-auto">
              <span>User ID: {user?.uid.slice(-8).toUpperCase() || '--------'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/wallet/deposit" className="flex-1" prefetch={false}>
          <Button className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl gap-3">
            <PlusCircle size={20} /> Add Funds
          </Button>
        </Link>
        <Link href="/wallet/history" className="flex-1" prefetch={false}>
          <Button variant="outline" className="w-full h-14 border-border bg-card text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl gap-3">
            <History size={20} /> History
          </Button>
        </Link>
      </div>

      <div className="space-y-5">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Recent Activity</h3>
          <Link href="/wallet/history" prefetch={false}><span className="text-[10px] font-black text-primary uppercase border-b border-primary/30">View All</span></Link>
        </div>
        <div className="space-y-3 pb-10">
          {(!initialized || transactionsLoading) ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          ) : recentTransactions.length === 0 ? (
            <div className="bg-card/20 border border-dashed border-border p-10 rounded-2xl text-center">
              <p className="text-[10px] font-black uppercase text-muted-foreground">No recent transactions</p>
            </div>
          ) : (
             recentTransactions.map((tx) => (
               <div key={tx.transactionId} className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border", tx.type === 'deposit' ? 'bg-green-500/10 border-green-500/10' : 'bg-primary/10 border-primary/20')}>
                      {tx.type === 'deposit' ? <ArrowDownLeft className="h-6 w-6 text-green-500" /> : <ArrowUpRight className="h-6 w-6 text-primary" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase text-white">{tx.type}</h4>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">
                        {isMounted ? new Date(tx.createdAt).toLocaleDateString() : '...'} • {tx.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black">
                      <span className={cn(tx.type === 'deposit' ? 'text-green-400' : 'text-primary')}>
                        {tx.type === 'deposit' ? '+' : '-'} ₹{tx.amount}
                      </span>
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
