"use client"

import { useMemo } from "react";
import { Wallet, Package, Clock, CheckCircle2, TrendingUp, CreditCard, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore } from "@/firebase/provider";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useCollection } from "@/firebase/firestore/use-collection";
import { doc, collection, query, where, limit, orderBy } from "firebase/firestore";
import Link from "next/link";

export default function DashboardPage() {
  const { user, profile, loading: userLoading } = useUser();
  const db = useFirestore();

  const walletRef = useMemo(() => user ? doc(db, 'wallets', user.uid) : null, [user, db]);
  const { data: wallet, loading: walletLoading } = useDoc(walletRef);

  const ordersQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [user, db]);

  const { data: orders, loading: ordersLoading } = useCollection(ordersQuery);

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

  const balance = wallet?.balance || 0;

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
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">My Dashboard</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">
          HUB IDENTITY: {profile?.fullName || user?.email?.split('@')[0].toUpperCase()}
        </p>
      </header>

      {/* Wallet Card */}
      <Card className="bg-gradient-to-br from-primary via-primary to-accent border-none shadow-2xl shadow-primary/20 overflow-hidden relative rounded-3xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150"><Wallet size={120} /></div>
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">Wallet Balance</span>
              <h2 className="text-5xl font-black text-white tracking-tighter">
                ₹{balance.toLocaleString()}<span className="text-2xl text-white/60">.00</span>
              </h2>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/20">
              <TrendingUp className="text-white h-6 w-6" />
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/wallet/deposit" className="flex-1">
              <Button className="w-full bg-white text-primary hover:bg-white/90 font-black text-[11px] h-12 uppercase tracking-[0.2em] rounded-2xl transition-all">
                <CreditCard className="mr-2 h-4 w-4" /> Deposit
              </Button>
            </Link>
            <Link href="/wallet/history" className="flex-1">
              <Button className="w-full bg-black/20 hover:bg-black/30 text-white border border-white/20 font-black text-[11px] h-12 uppercase tracking-[0.2em] rounded-2xl transition-all">
                Statement
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
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

      {/* Recent Activity */}
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
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No recent transactions detected</p>
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
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.status}
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
