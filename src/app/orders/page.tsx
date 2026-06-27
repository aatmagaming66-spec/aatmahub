'use client';

import { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle2, XCircle, Search, Hash, AlertCircle, Loader2, Calendar, IndianRupee, ArrowRight, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function OrdersPage() {
  const { user, initialized } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

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

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Completed' };
      case 'processing': return { icon: Loader2, color: 'text-accent', bg: 'bg-accent/10', animate: 'animate-spin', label: 'Processing' };
      case 'pending': return { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'Pending' };
      case 'cancelled':
      case 'failed': return { icon: XCircle, color: 'text-primary', bg: 'bg-primary/10', label: 'Failed' };
      default: return { icon: AlertCircle, color: 'text-muted-foreground', bg: 'bg-muted/10', label: status };
    }
  };

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-300 pb-20">
      <header className="py-6">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none">My Orders</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">View your purchase history</p>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search by Order ID or Game..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border pl-12 h-14 rounded-none text-sm font-bold focus:border-primary shadow-xl"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-card/50 border border-border h-14 p-1.5 rounded-none mb-8 overflow-x-auto no-scrollbar">
          {['all', 'pending', 'processing', 'completed'].map(t => (
            <TabsTrigger key={t} value={t} className="flex-1 min-w-[80px] text-[10px] font-black uppercase rounded-none data-[state=active]:bg-primary">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {(!initialized || ordersLoading) ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border p-6 rounded-none space-y-4 shadow-xl">
                <div className="flex justify-between"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-6 w-20" /></div>
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-between"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-4 w-1/4" /></div>
              </div>
            ))
          ) : filteredOrders.length === 0 ? (
            <div className="py-24 text-center space-y-6 bg-card/20 rounded-none border border-dashed border-border flex flex-col items-center">
              <Package size={40} className="text-white/10" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">No orders found</p>
                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">You haven't made any purchases in this category yet</p>
              </div>
              <Link href="/" prefetch={false}><Button className="bg-primary h-10 px-8 rounded-none font-black uppercase text-[10px] tracking-widest">Shop Now</Button></Link>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const firstItem = order.items?.[0] || { name: 'Store Item', region: 'Global' };
              const config = getStatusConfig(order.status);
              const StatusIcon = config.icon;

              return (
                <div key={order.orderId} className="bg-card border border-border rounded-none shadow-2xl relative overflow-hidden group hover:border-primary/30 transition-all">
                  <div className={cn("absolute top-0 right-0 p-8 opacity-5 -rotate-12 transition-transform group-hover:scale-110", config.color)}><Package size={100} /></div>
                  
                  <div className="p-6 space-y-6 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-primary">
                          <Hash size={10} className="stroke-[3]" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{order.orderId.replace('AH-2026-', '')}</span>
                        </div>
                        <h4 className="text-base font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">{firstItem.name}</h4>
                      </div>
                      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-none border border-white/5", config.bg)}>
                        <StatusIcon size={12} className={cn(config.color, config.animate)} />
                        <span className={cn("text-[9px] font-black uppercase tracking-[0.1em]", config.color)}>{config.label}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                      <div className="space-y-1">
                         <div className="flex items-center gap-1.5 text-white/30"><Calendar size={10} /><span className="text-[8px] font-black uppercase tracking-widest">Date</span></div>
                         <p className="text-[11px] font-black text-white/80 uppercase">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="space-y-1 text-right">
                         <div className="flex items-center gap-1.5 text-white/30 justify-end"><IndianRupee size={10} /><span className="text-[8px] font-black uppercase tracking-widest">Price</span></div>
                         <p className="text-xl font-black text-primary tracking-tighter">₹{order.totalAmount}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                       <Link href={`/orders/${order.orderId}`} className="flex-1">
                         <Button variant="outline" className="w-full h-11 border-border rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-white/5 gap-2">
                           View Details <ArrowRight size={12} />
                         </Button>
                       </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
