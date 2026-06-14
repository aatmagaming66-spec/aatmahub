"use client"

import { Wallet, Package, Clock, CheckCircle2, TrendingUp, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const stats = [
    { label: "Total Orders", value: "24", icon: Package, color: "text-primary" },
    { label: "Pending", value: "2", icon: Clock, color: "text-orange-400" },
    { label: "Completed", value: "22", icon: CheckCircle2, color: "text-green-400" },
  ];

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">My Dashboard</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">HUB IDENTITY: AATMA HUB</p>
      </header>

      {/* Wallet Card */}
      <Card className="bg-gradient-to-br from-primary via-primary to-accent border-none shadow-2xl shadow-primary/20 overflow-hidden relative rounded-3xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150"><Wallet size={120} /></div>
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">Wallet Balance</span>
              <h2 className="text-5xl font-black text-white tracking-tighter">₹1,250<span className="text-2xl text-white/60">.00</span></h2>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/20">
              <TrendingUp className="text-white h-6 w-6" />
            </div>
          </div>
          <div className="flex gap-4">
            <Button className="flex-1 bg-white text-primary hover:bg-white/90 font-black text-[11px] h-12 uppercase tracking-[0.2em] rounded-2xl transition-all">
              <CreditCard className="mr-2 h-4 w-4" /> Deposit
            </Button>
            <Button className="flex-1 bg-black/20 hover:bg-black/30 text-white border border-white/20 font-black text-[11px] h-12 uppercase tracking-[0.2em] rounded-2xl transition-all">
              Statement
            </Button>
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
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/50">Recent Transactions</h3>
          <button className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/30">History</button>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border p-5 rounded-3xl flex items-center justify-between group active:bg-white/5 transition-all hover:border-accent/30 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/10 group-hover:scale-105 transition-transform">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight">86 Diamonds</h4>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">MLBB India • 2:40 PM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">₹99.00</p>
                <p className="text-[8px] font-black text-green-400 uppercase tracking-widest mt-0.5">Verified</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}