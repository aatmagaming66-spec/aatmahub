'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, query, collection, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle, History, ArrowUpRight, ArrowDownLeft, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, profile, initialized } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [user, initialized, router]);

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

  const balance = wallet?.balance || 0;

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700 pb-24">
      <header className="flex items-center gap-4 py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full hover:bg-white/5 active-press"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none text-white">User Dashboard</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Your Account and Wallet</p>
        </div>
      </header>

      <div 
        className="w-full mb-6 [perspective:1200px] cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={cn(
          "relative w-full min-h-[250px] transition-all duration-700 [transform-style:preserve-3d] active:scale-[0.97]",
          isFlipped && "[transform:rotateY(180deg)]"
        )}>
          {/* FRONT OF CARD */}
          <div className={cn(
            "absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[2rem] overflow-hidden shadow-3d border border-white/20 p-8 flex flex-col justify-between bg-gradient-to-br from-[#110000] via-primary to-accent active-press"
          )}>
            <div className="absolute top-0 right-0 p-8 opacity-20 -rotate-12 translate-x-4 -translate-y-4">
              <div className="h-40 w-40 border-[12px] border-white/10 rounded-full" />
            </div>
            
            <div className="flex justify-between items-start gap-4 relative z-10">
              <span className="font-headline font-black text-xl tracking-tighter text-white uppercase drop-shadow-2xl">AATMA HUB</span>
              <div className="backdrop-blur-xl border border-white/30 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-2xl bg-black/40 text-white">
                <ShieldCheck size={10} className="text-green-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/90">Account Verified</span>
              </div>
            </div>
            <div className="mt-auto space-y-4 relative z-10">
              <div className="space-y-0.5 min-w-0">
                 {!initialized ? <Skeleton className="h-6 w-40 bg-white/10" /> : (
                   <p className="text-xl font-black text-white uppercase tracking-tight leading-none truncate drop-shadow-xl">{profile?.fullName || 'User Name'}</p>
                 )}
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">Registered Member</p>
              </div>
              <div className="flex justify-between items-center text-[8px] font-black uppercase text-white/40 border-t border-white/10 pt-4 gap-2">
                <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Status: <span className="text-green-400">Online</span></span>
              </div>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div className={cn(
            "absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[2rem] overflow-hidden shadow-3d border border-white/20 flex flex-col bg-gradient-to-br from-accent via-primary to-[#110000]"
          )}>
            <div className="w-full h-12 bg-black/60 mt-8 shadow-inner shrink-0" />
            <div className="flex-1 px-8 flex flex-col justify-center text-center space-y-2">
              <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">Available Balance</span>
              {walletLoading ? <Skeleton className="h-12 w-32 mx-auto bg-white/10" /> : (
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
                  ₹{balance.toLocaleString()}<span className="text-2xl text-white/60">.00</span>
                </h2>
              )}
            </div>
            <div className="p-6 border-t border-white/10 bg-black/40 flex justify-between items-center text-[8px] font-black uppercase text-white/40 tracking-widest mt-auto">
               <span>ID: {user?.uid.slice(-12).toUpperCase() || '--------'}</span>
               <span className="flex items-center gap-2">Security: <ShieldCheck size={10} className="text-green-500" /> SECURE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/wallet/deposit" className="flex-1" prefetch={false}>
          <Button className="w-full h-16 bg-primary hover:bg-secondary text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-3d gap-4 group">
            <PlusCircle className="h-6 w-6 group-hover:rotate-90 transition-transform" /> Add Money
          </Button>
        </Link>
        <Link href="/wallet/history" className="flex-1" prefetch={false}>
          <Button variant="outline" className="w-full h-16 border-border bg-card text-white hover:bg-white/5 font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-3d gap-4">
            <History className="h-6 w-6" /> History
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 bg-primary rounded-full" />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/50">Recent Transactions</h3>
          </div>
          <Link href="/wallet/history" prefetch={false}>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/40 hover:text-white hover:border-white transition-colors">View All</span>
          </Link>
        </div>
        
        <div className="space-y-4">
          {transactionsLoading || !initialized ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl bg-card shadow-3d" />)
          ) : recentTransactions.length === 0 ? (
            <div className="bg-card/20 border border-dashed border-border p-12 rounded-[2rem] text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No transactions found</p>
            </div>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.transactionId} className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-3d hover:border-primary/40 hover:scale-[1.01] transition-all group">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:rotate-6",
                    tx.type === 'deposit' ? 'bg-green-500/10 border-green-500/20' : 'bg-primary/10 border-primary/20'
                  )}>
                    {tx.type === 'deposit' ? <ArrowDownLeft className="h-7 w-7 text-green-500" /> : <ArrowUpRight className="h-7 w-7 text-primary" />}
                  </div>
                  <div>
                    <h4 className="text-base font-black uppercase tracking-tight text-white leading-none mb-1.5">{tx.type}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-2">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} <div className="h-1 w-1 rounded-full bg-white/10" /> <span className={cn(tx.status === 'success' ? 'text-green-500/60' : 'text-orange-400/60')}>{tx.status}</span>
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
