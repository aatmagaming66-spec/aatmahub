'use client';

import { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle2, XCircle, Search, Hash, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const { user, initialized } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // REDIRECT GATING
  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [user, initialized, router]);

  const ordersQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );
  }, [user, db]);

  const { data: rawOrders, loading: ordersLoading } = useCollection(ordersQuery);

  const filteredOrders = useMemo(() => {
    if (!rawOrders) return [];
    return [...rawOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter(order => {
        const productName = order.items?.[0]?.name || '';
        const matchesSearch = order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             productName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' || order.status.toLowerCase() === activeTab.toLowerCase();
        return matchesSearch && matchesTab;
      });
  }, [rawOrders, searchQuery, activeTab]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' };
      case 'processing': return { icon: Loader2, color: 'text-accent', bg: 'bg-accent/10', animate: 'animate-spin' };
      case 'pending': return { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' };
      case 'cancelled':
      case 'failed': return { icon: XCircle, color: 'text-primary', bg: 'bg-primary/10' };
      default: return { icon: AlertCircle, color: 'text-muted-foreground', bg: 'bg-muted/10' };
    }
  };

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-500">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">My Orders</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Digital Asset Tracking</p>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by Order ID or Product..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border pl-12 h-14 rounded-2xl text-sm font-bold shadow-xl"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-card/50 border border-border h-14 p-1.5 rounded-2xl mb-8">
          {['all', 'pending', 'processing', 'completed'].map(t => (
            <TabsTrigger key={t} value={t} className="flex-1 text-[10px] font-black uppercase rounded-xl data-[state=active]:bg-primary">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {ordersLoading || !initialized ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-[2rem] bg-card" />)
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-card/20 rounded-[2.5rem] border border-dashed border-border">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">No orders found</p>
              <Link href="/"><Button variant="link" className="text-primary font-black uppercase text-[10px]">Start Shopping</Button></Link>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const firstItem = order.items?.[0] || { name: 'Digital Asset', region: 'Global' };
              const s = getStatusIcon(order.status);
              const StatusIcon = s.icon;

              return (
                <Link key={order.orderId} href={`/orders/${order.orderId}`} className="block">
                  <div className="bg-card border border-border p-6 rounded-[2rem] space-y-5 shadow-xl hover:border-primary/40 transition-all active:scale-[0.98]">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-primary">
                          <Hash size={10} className="stroke-[3]" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{order.orderId.replace('AH-2026-', '')}</span>
                        </div>
                        <h4 className="text-base font-black uppercase tracking-tight">{firstItem.name}</h4>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${s.bg} border border-white/5`}>
                        <StatusIcon size={12} className={`${s.color} ${s.animate || ''}`} />
                        <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${s.color}`}>{order.status}</span>
                      </div>
                    </div>
                    <div className="pt-5 border-t border-border flex justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-white/30 uppercase">Category</span>
                        <span className="text-xs font-black uppercase">{firstItem.region}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-black text-white/30 uppercase">Total Paid</span>
                        <span className="text-lg font-black text-white">₹{order.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
