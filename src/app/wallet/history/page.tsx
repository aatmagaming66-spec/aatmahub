'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ArrowUpRight, ArrowDownLeft, Hash, Filter } from 'lucide-react';

export default function WalletHistoryPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const txQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [user, db]);

  const { data: transactions, loading } = useCollection(txQuery);

  if (!user && !loading) {
    router.push('/login');
    return null;
  }

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
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none">Transaction Log</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">HUB FINANCIAL HISTORY</p>
        </div>
      </header>

      {/* Filter Chips UI Placeholder */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <Button variant="outline" className="h-8 rounded-full text-[9px] font-black uppercase px-4 bg-primary border-primary text-white">All Logs</Button>
        <Button variant="outline" className="h-8 rounded-full text-[9px] font-black uppercase px-4 border-border">Deposits</Button>
        <Button variant="outline" className="h-8 rounded-full text-[9px] font-black uppercase px-4 border-border">Purchases</Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-card/20 rounded-[2.5rem] border border-dashed border-border">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">No financial records found</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.transactionId} className="bg-card border border-border p-6 rounded-[2rem] space-y-5 shadow-xl group hover:border-primary/40 transition-all">
              <div className="flex justify-between items-start">
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
                    <div className="flex items-center gap-1.5 text-primary mb-0.5">
                      <Hash size={9} className="stroke-[3]" />
                      <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                        {tx.transactionId.split('-').slice(-1)}
                      </span>
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-tight">{tx.type}</h4>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black ${tx.type === 'deposit' ? 'text-green-400' : 'text-primary'}`}>
                    {tx.type === 'deposit' ? '+' : '-'} ₹{tx.amount}
                  </p>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">{tx.status}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}