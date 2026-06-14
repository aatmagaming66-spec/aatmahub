'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, query, collection, where, limit, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, TrendingUp, History, PlusCircle, ArrowUpRight, ArrowDownLeft, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export default function WalletDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const walletRef = useMemo(() => user ? doc(db, 'wallets', user.uid) : null, [user, db]);
  const { data: wallet, loading: walletLoading } = useDoc(walletRef);

  const transactionsQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [user, db]);

  const { data: recentTransactions, loading: transactionsLoading } = useCollection(transactionsQuery);

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
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Wallet Hub</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Digital Assets & Credits</p>
        </div>
      </header>

      {/* Main Balance Card */}
      <Card className="bg-gradient-to-br from-primary via-primary to-accent border-none shadow-2xl shadow-primary/20 overflow-hidden relative rounded-[2.5rem]">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
          <Wallet size={120} />
        </div>
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">Available Balance</span>
              <h2 className="text-6xl font-black text-white tracking-tighter">₹{balance.toLocaleString()}<span className="text-2xl text-white/60">.00</span></h2>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/20">
              <TrendingUp className="text-white h-6 w-6" />
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/wallet/deposit" className="flex-1">
              <Button className="w-full bg-white text-primary hover:bg-white/90 font-black text-[11px] h-14 uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Money
              </Button>
            </Link>
            <Link href="/wallet/history" className="flex-1">
              <Button className="w-full bg-black/20 hover:bg-black/30 text-white border border-white/20 font-black text-[11px] h-14 uppercase tracking-[0.2em] rounded-2xl transition-all">
                <History className="mr-2 h-4 w-4" /> History
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border rounded-3xl p-5 shadow-xl">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Status</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-black uppercase">Active Wallet</span>
          </div>
        </Card>
        <Card className="bg-card border-border rounded-3xl p-5 shadow-xl">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Security</span>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-primary" />
            <span className="text-sm font-black uppercase">Verified</span>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-5">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/50">Recent Activity</h3>
          <Link href="/wallet/history">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/30">View All</span>
          </Link>
        </div>
        
        <div className="space-y-3">
          {transactionsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="bg-card/20 border border-dashed border-border p-10 rounded-3xl text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.transactionId} className="bg-card border border-border p-5 rounded-3xl flex items-center justify-between group active:bg-white/5 transition-all shadow-lg">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${
                    tx.type === 'deposit' ? 'bg-green-500/10 border-green-500/10' : 'bg-primary/10 border-primary/10'
                  }`}>
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
                  <p className={`text-sm font-black ${tx.type === 'deposit' ? 'text-green-400' : 'text-primary'}`}>
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