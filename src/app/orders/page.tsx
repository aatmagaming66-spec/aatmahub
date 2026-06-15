
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle2, XCircle, Search, Hash, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OrdersPage() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // FIX: Removed server-side orderBy to prevent Index failure
  const ordersQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );
  }, [user, db]);

  const { data: rawOrders, loading: ordersLoading, error } = useCollection(ordersQuery);

  // FIX: Explicitly sort locally and filter
  const filteredOrders = useMemo(() => {
    if (!rawOrders) return [];
    
    // 1. Sort latest first
    const sorted = [...rawOrders].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // 2. Filter by search and tab
    return sorted.filter(order => {
      const productName = order.items?.[0]?.name || '';
      const matchesSearch = order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           productName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === 'all' || order.status.toLowerCase() === activeTab.toLowerCase();
      
      return matchesSearch && matchesTab;
    });
  }, [rawOrders, searchQuery, activeTab]);

  useEffect(() => {
    if (error) {
      console.error('[Orders Audit] Query Failed:', error.message);
    }
  }, [error]);

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

  if (userLoading || ordersLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center animate-in fade-in">
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Hash className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Access Denied</h2>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60 mb-8">
          Please login to view your orders
        </p>
        <Link href="/login">
          <Button className="bg-primary hover:bg-secondary h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">My Orders</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Digital Asset Tracking</p>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search by Order ID or Product..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border pl-12 h-14 rounded-2xl text-sm font-bold placeholder:text-muted-foreground focus:border-primary transition-all shadow-xl"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-card/50 border border-border h-14 p-1.5 rounded-2xl overflow-x-auto no-scrollbar justify-start mb-8">
          <TabsTrigger value="all" className="flex-shrink-0 text-[10px] font-black uppercase px-6 data-[state=active]:bg-primary rounded-xl">All</TabsTrigger>
          <TabsTrigger value="pending" className="flex-shrink-0 text-[10px] font-black uppercase px-6 data-[state=active]:bg-primary rounded-xl">Pending</TabsTrigger>
          <TabsTrigger value="processing" className="flex-shrink-0 text-[10px] font-black uppercase px-6 data-[state=active]:bg-primary rounded-xl">Processing</TabsTrigger>
          <TabsTrigger value="completed" className="flex-shrink-0 text-[10px] font-black uppercase px-6 data-[state=active]:bg-primary rounded-xl">Done</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          {filteredOrders.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-card/20 rounded-[2.5rem] border border-dashed border-border">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {error ? 'Firestore Protocol Violation Detected' : 'No orders matching your criteria'}
              </p>
              {error && <p className="text-[8px] text-primary/60 font-mono mt-2 uppercase">{error.message}</p>}
              <Link href="/" className="inline-block">
                <Button variant="link" className="text-primary font-black uppercase text-[10px] tracking-widest">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const firstItem = order.items?.[0] || { name: 'Unknown Item', region: 'Global', price: 0 };
              const statusStyle = getStatusIcon(order.status);
              const StatusIcon = statusStyle.icon;

              return (
                <Link key={order.orderId} href={`/orders/${order.orderId}`} className="block">
                  <div className="bg-card border border-border p-6 rounded-[2rem] space-y-5 shadow-xl group hover:border-primary/40 transition-all active:scale-[0.98]">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-primary">
                          <Hash size={10} className="stroke-[3]" />
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                            {order.orderId.replace('AH-2026-', '')}
                          </span>
                        </div>
                        <h4 className="text-base font-black uppercase tracking-tight">{firstItem.name}</h4>
                        {order.items?.length > 1 && (
                          <p className="text-[8px] font-black text-primary uppercase tracking-widest">+{order.items.length - 1} more items</p>
                        )}
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${statusStyle.bg} border border-white/5`}>
                        <StatusIcon size={12} className={`${statusStyle.color} ${statusStyle.animate || ''}`} />
                        <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${statusStyle.color}`}>{order.status}</span>
                      </div>
                    </div>
                    
                    <div className="pt-5 border-t border-border flex justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none">Category</span>
                        <span className="text-xs font-black uppercase">{firstItem.region || 'Global'}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none">Total Paid</span>
                        <span className="text-lg font-black text-white tracking-tighter leading-none">₹{order.totalAmount}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between opacity-50">
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">
                        Details <ArrowRight size={10} />
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
