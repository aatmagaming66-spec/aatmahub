
"use client"

import { useMemo, useEffect, useState } from "react";
import { Wallet, Package, Clock, CheckCircle2, TrendingUp, CreditCard, Loader2, Crown, Cpu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">My Wallet</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">
          HUB IDENTITY: {profile?.fullName || user?.email?.split('@')[0].toUpperCase()}
        </p>
      </header>

      {/* PREMIUM DEBIT CARD MINI VERSION FOR WALLET OVERVIEW */}
      <Link href="/wallet" className="block w-full">
        <div className="relative w-full aspect-[1.58/1] rounded-[2rem] overflow-hidden shadow-2xl group transition-transform duration-500 active:scale-[0.98]">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-[#8b0000]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
          
          <div className="relative h-full p-6 flex flex-col justify-between z-10">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="font-headline font-black text-lg tracking-tighter text-white/90 uppercase">AATMA HUB</span>
                <span className="text-[6px] font-black text-primary uppercase tracking-[0.4em]">Digital Banking</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-lg flex items-center gap-1.5 shadow-xl">
                 <Crown size={9} className="text-primary" />
                 <span className="text-[8px] font-black uppercase text-white tracking-widest">{profile?.role?.toUpperCase() || 'USER'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="h-8 w-11 bg-gradient-to-br from-yellow-600 to-yellow-200 rounded-md relative overflow-hidden flex items-center justify-center border border-yellow-400/50 shadow-inner shrink-0">
                  <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1 opacity-40">
                     {[...Array(9)].map((_, i) => <div key={i} className="border border-black/20" />)}
                  </div>
                  <Cpu className="absolute h-4 w-4 text-black/20" />
               </div>
               
               <div className="space-y-0.5">
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Available Balance</span>
                  <h2 className="text-4xl font-black text-white tracking-tighter">
                    ₹{balance.toLocaleString()}<span className="text-xl text-white/40">.00</span>
                  </h2>
               </div>
            </div>

            <div className="flex justify-between items-end">
               <div className="space-y-1">
                  <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">Identity</span>
                  <p className="text-xs font-black text-white uppercase tracking-tighter">{profile?.fullName || 'AATMA USER'}</p>
               </div>
               <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-primary transition-colors" />
            </div>
          </div>
          
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 z-20" />
        </div>
      </Link>

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

const ArrowRight = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);
