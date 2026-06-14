
"use client"

import { Wallet, Package, Clock, CheckCircle2, TrendingUp, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const stats = [
    { label: "Total Orders", value: "24", icon: Package, color: "text-blue-400" },
    { label: "Pending", value: "2", icon: Clock, color: "text-orange-400" },
    { label: "Completed", value: "22", icon: CheckCircle2, color: "text-green-400" },
  ];

  return (
    <div className="flex flex-col w-full p-4 space-y-6 animate-in fade-in duration-500">
      <header className="py-2">
        <h1 className="text-2xl font-headline font-bold">DASHBOARD</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Welcome back, AATMA</p>
      </header>

      {/* Wallet Card */}
      <Card className="bg-gradient-to-br from-primary via-primary/80 to-accent border-none shadow-2xl shadow-primary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet size={120} /></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Available Balance</span>
              <h2 className="text-4xl font-black text-white">₹1,250.00</h2>
            </div>
            <div className="h-10 w-10 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center">
              <TrendingUp className="text-white h-5 w-5" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button className="flex-1 bg-white text-primary hover:bg-white/90 font-black text-[11px] h-11 uppercase tracking-wider">
              <CreditCard className="mr-2 h-4 w-4" /> Add Money
            </Button>
            <Button className="flex-1 bg-black/20 hover:bg-black/30 text-white border border-white/10 font-black text-[11px] h-11 uppercase tracking-wider">
              History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card border-white/5 shadow-lg">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <span className="text-lg font-black leading-none">{stat.value}</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-sm font-headline font-bold uppercase tracking-widest">Recent Activity</h3>
          <button className="text-[10px] font-bold text-primary uppercase">View All</button>
        </div>
        
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-white/5 p-4 rounded-2xl flex items-center justify-between group active:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">86 Diamonds</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">MLBB India • Today, 2:40 PM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black">₹99.00</p>
                <p className="text-[9px] font-black text-green-400 uppercase tracking-tighter">Completed</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
