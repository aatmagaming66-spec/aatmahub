'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ArrowUpRight, ArrowDownLeft, Hash, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WalletHistoryPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'deposit' | 'purchase'>('all');

  const txQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid)
    );
  }, [user, db]);

  const { data: rawTransactions, loading } = useCollection(txQuery);

  const transactions = useMemo(() => {
    if (!rawTransactions) return [];
    let list = [...rawTransactions];
    
    if (filter !== 'all') {
      list = list.filter(t => t.type === filter);
    }

    return list.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [rawTransactions, filter]);

  if (!user && !loading) {
    router.push('/login');
    return null;
  }

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
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none">Transaction Log</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">HUB FINANCIAL HISTORY</p>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button 
          onClick={() => setFilter('all')}
          className={cn(
            "h-9 px-5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
            filter === 'all' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-card border border-border text-muted-foreground"
          )}
        >
          All Logs
        </button>
        <button 
          onClick={() => setFilter('deposit')}
          className={cn(
            "h-9 px-5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
            filter === 'deposit' ? "bg-green-600 text-white shadow-lg shadow-green-500/20" : "bg-card border border-border text-muted-foreground"
          )}
        >
          Deposits
        </button>
        <button 
          onClick={() => setFilter('purchase')}
          className={cn(
            "h-9 px-5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
            filter === 'purchase' ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-card border border-border text-muted-foreground"
          )}
        >
          Purchases
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-card/20 rounded-[2rem] border border-dashed border-border flex flex-col items-center">
            <Filter size={40} className="text-white/10" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">No matching records found</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.transactionId} className="bg-card border border-border p-5 rounded-[1.5rem] space-y-4 shadow-xl hover:border-primary/30 transition-all group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center border",
                    tx.type === 'deposit' ? 'bg-green-500/10 border-green-500/10' : 'bg-primary/10 border-primary/10'
                  )}>
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
                    <h4 className="text-sm font-black uppercase tracking-tight text-white/90">{tx.type}</h4>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-xl font-black tracking-tighter", tx.type === 'deposit' ? 'text-green-400' : 'text-primary')}>
                    {tx.type === 'deposit' ? '+' : '-'} ₹{tx.amount}
                  </p>
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded border",
                    tx.status === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-orange-500/10 text-orange-500 border-orange-500/10'
                  )}>
                    {tx.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
