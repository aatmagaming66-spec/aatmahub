'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, query, collection, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle, History, ArrowUpRight, ArrowDownLeft, ArrowLeft } from 'lucide-react';
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
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700 pb-20">
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
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none text-white">Dashboard</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Account overview and funds</p>
        </div>
      </header>

      <div 
        className="w-full mb-6 [perspective:1000px] cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={cn(
          "relative w-full min-h-[180px] transition-all duration-700 [transform-style:preserve-3d]",
          isFlipped && "[transform:rotateY(180deg)]"
        )}>
          {/* FRONT OF CARD */}
          <div className={cn(
            "absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[1.375rem] overflow-hidden shadow-2xl border p-6 flex flex-col justify-between bg-gradient-to-br from-[#110000] via-[#dc2626] to-[#ec4899] border-white/20"
          )}>
            <div className="absolute top-0 right-0 p-8 opacity-20 -rotate-12 translate-x-4 -translate-y-4">
              <div className="h-32 w-32 border-8 border-white/20 rounded-full" />
            </div>
            
            <div className="flex justify-between items-start gap-4 relative z-10">
              <span className="font-headline font-black text-sm tracking-tighter text-white uppercase drop-shadow-md">AATMA HUB</span>
              <div className="backdrop-blur-md border border-white/20 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-xl bg-black/40 text-white">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/80">Active</span>
              </div>
            </div>
            <div className="mt-auto space-y-2 relative z-10">
              <div className="space-y-0.5 min-w-0">
                 {!initialized ? <Skeleton className="h-5 w-32 bg-white/10" /> : (
                   <p className="text-sm font-black text-white uppercase tracking-tight leading-none truncate drop-shadow-sm">{profile?.fullName || 'AATMA OPERATOR'}</p>
                 )}
                 <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/60">Verified Member</p>
              </div>
              <div className="flex justify-between items-center text-[7px] font-black uppercase text-white/40 border-t border-white/10 pt-2 gap-2">
                <span>Account: <span className="text-green-400">Verified</span></span>
                <span>Spend: <span className="text-white">₹{profile?.lifetimeSpend?.toLocaleString() || 0}</span></span>
              </div>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div className={cn(
            "absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[1.375rem] overflow-hidden shadow-2xl border flex flex-col bg-gradient-to-br from-[#ec4899] via-[#dc2626] to-[#110000] border-white/20"
          )}>
            <div className="w-full h-10 bg-black/60 mt-4 shadow-inner shrink-0" />
            <div className="flex-1 px-6 flex flex-col justify-center text-center space-y-1">
              <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em]">Available Balance</span>
              {walletLoading ? <Skeleton className="h-10 w-24 mx-auto bg-white/10" /> : (
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter leading-none drop-shadow-lg">
                  ₹{balance.toLocaleString()}<span className="text-lg text-white/60">.00</span>
                </h2>
              )}
            </div>
            <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center text-[7px] font-black uppercase text-white/40 tracking-widest mt-auto">
               <span>Member ID: {user?.uid.slice(-8).toUpperCase() || '--------'}</span>
               <span>Volume: ₹{profile?.lifetimeSpend?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/wallet/deposit" className="flex-1">
          <Button className="w-full h-14 bg-primary hover:bg-secondary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-primary/20 gap-3 group">
            <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform" /> Deposit
          </Button>
        </Link>
        <Link href="/wallet/history" className="flex-1">
          <Button variant="outline" className="w-full h-14 border-border bg-card text-white hover:bg-white/5 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all gap-3">
            <History className="h-5 w-5" /> History
          </Button>
        </Link>
      </div>

      <div className="space-y-5">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Recent Activity</h3>
          <Link href="/wallet/history">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/30">View All</span>
          </Link>
        </div>
        
        <div className="space-y-3 pb-10">
          {transactionsLoading || !initialized ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-card" />)
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
