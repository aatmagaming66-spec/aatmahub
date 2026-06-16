
"use client"

import { useMemo, useEffect, useState } from "react";
import { Wallet, Package, Clock, CheckCircle2, TrendingUp, CreditCard, Loader2, Crown, Cpu, ShieldCheck, Target, Zap, ChevronRight, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore } from "@/firebase/provider";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useCollection } from "@/firebase/firestore/use-collection";
import { doc, collection, query, where } from "firebase/firestore";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user, profile, loading: userLoading } = useUser();
  const db = useFirestore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const walletRef = useMemo(() => user ? doc(db, 'wallets', user.uid) : null, [user, db]);
  const { data: wallet, loading: walletLoading } = useDoc(walletRef);

  const ordersQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );
  }, [user, db]);

  const { data: rawOrders, loading: ordersLoading } = useCollection(ordersQuery);

  const orders = useMemo(() => {
    if (!rawOrders) return [];
    return [...rawOrders].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [rawOrders]);

  const lifetimeSpend = useMemo(() => {
    if (!rawOrders) return 0;
    return rawOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [rawOrders]);

  const rankData = useMemo(() => {
    const RANKS = [
      { name: 'Warrior', threshold: 0, discount: 0 },
      { name: 'Elite', threshold: 500, discount: 0 },
      { name: 'Master', threshold: 1500, discount: 0 },
      { name: 'Grandmaster', threshold: 3000, discount: 0 },
      { name: 'Epic', threshold: 7500, discount: 0 },
      { name: 'Legend', threshold: 15000, discount: 0 },
      { name: 'Mythic', threshold: 30000, discount: 0 },
      { name: 'Mythical Honor', threshold: 50000, discount: 1 },
      { name: 'Mythical Glory', threshold: 75000, discount: 2 },
      { name: 'Mythical Immortal', threshold: 100000, discount: 3 },
    ];

    let currentIdx = 0;
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (lifetimeSpend >= RANKS[i].threshold) {
        currentIdx = i;
        break;
      }
    }

    const current = RANKS[currentIdx];
    const next = currentIdx < RANKS.length - 1 ? RANKS[currentIdx + 1] : null;
    
    let progress = 100;
    if (next) {
      progress = Math.min(100, Math.floor(((lifetimeSpend - current.threshold) / (next.threshold - current.threshold)) * 100));
    }

    return { current, next, progress, lifetimeSpend };
  }, [lifetimeSpend]);

  const getRankColor = (rankName: string) => {
    const name = rankName.toLowerCase();
    if (name.includes('warrior')) return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
    if (name.includes('elite')) return 'text-slate-200 border-slate-200/30 bg-slate-200/10';
    if (name.includes('master')) return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
    if (name.includes('grandmaster')) return 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10';
    if (name.includes('epic')) return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
    if (name.includes('legend')) return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    if (name.includes('mythical immortal')) return 'text-red-600 border-red-600/40 bg-red-600/20 shadow-[0_0_10px_rgba(220,38,38,0.2)]';
    if (name.includes('mythic')) return 'text-red-500 border-red-500/30 bg-red-500/10';
    return 'text-primary border-primary/20 bg-primary/10';
  };

  const stats = useMemo(() => {
    const total = orders?.length || 0;
    const pending = orders?.filter(o => o.status === 'pending' || o.status === 'processing').length || 0;
    const completed = orders?.filter(o => o.status === 'completed').length || 0;

    return [
      { label: "Total Orders", value: total.toString(), icon: Package, color: "text-primary" },
      { label: "Active", value: pending.toString(), icon: Clock, color: "text-orange-400" },
      { label: "Completed", value: completed.toString(), icon: CheckCircle2, color: "text-green-400" },
    ];
  }, [orders]);

  const balance = wallet?.balance ?? 0;

  if (userLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-4 space-y-6 animate-in fade-in duration-700">
      <header className="py-2">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">My Wallet</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">
          HUB IDENTITY: {profile?.fullName || user?.email?.split('@')[0].toUpperCase()}
        </p>
      </header>

      {/* PREMIUM DEBIT CARD - REDESIGNED LAYOUT */}
      <Link href="/wallet" className="block w-full mb-10">
        <div className="relative w-full aspect-[2.1/1] rounded-[2rem] overflow-hidden shadow-2xl group transition-transform duration-500 active:scale-[0.98]">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-[#8b0000]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
          
          <div className="relative h-full p-5 flex flex-col justify-between z-10">
            {/* Top Row: Logo & Rank Badge */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="font-headline font-black text-sm tracking-tighter text-white/90 uppercase">AATMA HUB</span>
                <span className="text-[5px] font-black text-primary uppercase tracking-[0.4em]">Digital Banking</span>
              </div>
              <div className={cn(
                "backdrop-blur-md border px-2 py-0.5 rounded-lg flex items-center gap-1.5 shadow-xl transition-colors duration-500",
                getRankColor(rankData.current.name)
              )}>
                 <Crown size={8} className="fill-current/20" />
                 <span className="text-[7px] font-black uppercase tracking-widest">{rankData.current.name}</span>
              </div>
            </div>

            {/* Center Area: Chip (Left) and Balance (Center) */}
            <div className="relative flex items-center justify-center">
               <div className="absolute left-0 h-7 w-10 bg-gradient-to-br from-yellow-600 to-yellow-200 rounded-md relative overflow-hidden flex items-center justify-center border border-yellow-400/50 shadow-inner shrink-0 opacity-80">
                  <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1 opacity-40">
                     {[...Array(9)].map((_, i) => <div key={i} className="border border-black/20" />)}
                  </div>
                  <Cpu className="absolute h-3 w-3 text-black/20" />
               </div>
               
               <div className="text-center space-y-0 translate-y-1">
                  <span className="text-[7px] font-black text-white/40 uppercase tracking-widest block mb-0.5">Available Balance</span>
                  <h2 className="text-3xl font-black text-white tracking-tighter leading-none">
                    ₹{balance.toLocaleString()}<span className="text-lg text-white/40">.00</span>
                  </h2>
               </div>
            </div>

            {/* Bottom Section: Identity, Card Number, Arrow, and Strip */}
            <div className="space-y-3">
               <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                     <span className="text-[6px] font-black text-white/30 uppercase tracking-widest leading-none">Card Holder</span>
                     <p className="text-[9px] font-black text-white uppercase tracking-tighter leading-none">{profile?.fullName || 'AATMA USER'}</p>
                  </div>
                  
                  <div className="flex-1 text-center">
                    <p className="text-[8px] font-mono font-black text-white/30 tracking-[0.2em]">**** **** **** 2047</p>
                  </div>

                  <div className="flex items-center">
                    <ArrowRight className="h-3.5 w-3.5 text-white/40 group-hover:text-primary transition-colors" />
                  </div>
               </div>
               
               {/* Bottom Info Strip Row */}
               <div className="flex justify-between items-center text-[6px] font-black uppercase text-white/20 tracking-widest pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1">Rank: <span className="text-white/40">{rankData.current.name}</span></span>
                  <span className="flex items-center gap-1">Discount: <span className="text-green-500/60">{rankData.current.discount}% OFF</span></span>
                  <span className="flex items-center gap-1">Spend: <span className="text-primary/60">₹{lifetimeSpend.toLocaleString()}</span></span>
               </div>
            </div>
          </div>
          
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 z-20" />
        </div>
      </Link>

      {/* RANK PROGRESSION SECTION */}
      <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-headline font-black uppercase tracking-widest text-white/90">Rank Progression</h3>
            </div>
            <div className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
              <span className="text-[8px] font-black uppercase text-primary tracking-widest">{rankData.current.discount}% Discount Active</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-2">
            <div className="space-y-0.5">
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Current Rank</p>
              <p className="text-sm font-black text-white uppercase tracking-tight">{rankData.current.name}</p>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Lifetime Spend</p>
              <p className="text-sm font-black text-primary tracking-tight">₹{lifetimeSpend.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">
                {rankData.next ? `Next: ${rankData.next.name}` : 'Max Rank Reached'}
              </span>
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                {rankData.progress}%
              </span>
            </div>
            <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_#DC2626]" 
                style={{ width: `${rankData.progress}%` }} 
              />
            </div>
            <div className="flex justify-between items-center text-[7px] font-black uppercase text-muted-foreground tracking-widest px-0.5">
               <span>₹{lifetimeSpend.toLocaleString()} spent</span>
               {rankData.next && <span>₹{rankData.next.threshold.toLocaleString()} required</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-xl rounded-2xl overflow-hidden group hover:border-accent/30 transition-all">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <stat.icon className={`h-6 w-6 ${stat.color} mb-3 group-hover:scale-110 transition-transform`} />
              <span className="text-xl font-black leading-none">{stat.value}</span>
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-5">
        <div className="flex justify-between items-end px-1">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/50">Recent Orders</h3>
          <Link href="/orders">
            <button className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/30">View All</button>
          </Link>
        </div>
        
        <div className="space-y-3">
          {ordersLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : orders?.length === 0 ? (
            <div className="bg-card/20 border border-dashed border-border p-10 rounded-3xl text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                No recent transactions detected
              </p>
            </div>
          ) : (
            orders?.slice(0, 3).map((order) => (
              <Link key={order.orderId} href={`/orders/${order.orderId}`}>
                <div className="bg-card border border-border p-5 rounded-3xl flex items-center justify-between group active:bg-white/5 transition-all hover:border-accent/30 shadow-lg mb-3">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/10 group-hover:scale-105 transition-transform">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight truncate max-w-[120px]">
                        {order.items?.[0]?.name || 'Digital Item'}
                      </h4>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                        {isMounted ? `${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${order.status}` : '...'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">₹{order.totalAmount}</p>
                    <p className="text-[8px] font-black text-green-400 uppercase tracking-widest mt-0.5">Secured</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
