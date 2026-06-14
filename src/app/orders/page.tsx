"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle2, XCircle, Search, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";

const ORDERS = [
  { id: "#AH-92381", product: "86 Diamonds", game: "MLBB India", price: "₹99", status: "Completed", date: "24 Feb 2024", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10" },
  { id: "#AH-92380", product: "Weekly Pass", game: "Magic Chess", price: "₹159", status: "Processing", date: "23 Feb 2024", icon: Clock, color: "text-accent", bg: "bg-accent/10" },
  { id: "#AH-92379", product: "Netflix UHD", game: "OTT Premium", price: "₹499", status: "Pending", date: "22 Feb 2024", icon: Clock, color: "text-orange-400", bg: "bg-orange-400/10" },
  { id: "#AH-92378", product: "1000 Followers", game: "Instagram", price: "₹250", status: "Cancelled", date: "21 Feb 2024", icon: XCircle, color: "text-primary", bg: "bg-primary/10" },
];

export default function OrdersPage() {
  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">My Orders</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Digital Asset Tracking</p>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search by Order ID..." 
          className="bg-card border-border pl-12 h-14 rounded-2xl text-sm font-bold placeholder:text-muted-foreground focus:border-primary transition-all"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full bg-card/50 border border-border h-14 p-1.5 rounded-2xl overflow-x-auto no-scrollbar justify-start mb-8">
          <TabsTrigger value="all" className="flex-shrink-0 text-[10px] font-black uppercase px-6 data-[state=active]:bg-primary">All</TabsTrigger>
          <TabsTrigger value="pending" className="flex-shrink-0 text-[10px] font-black uppercase px-6 data-[state=active]:bg-primary">Pending</TabsTrigger>
          <TabsTrigger value="processing" className="flex-shrink-0 text-[10px] font-black uppercase px-6 data-[state=active]:bg-primary">Processing</TabsTrigger>
          <TabsTrigger value="completed" className="flex-shrink-0 text-[10px] font-black uppercase px-6 data-[state=active]:bg-primary">Done</TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-shrink-0 text-[10px] font-black uppercase px-6 data-[state=active]:bg-primary">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {ORDERS.map((order) => (
            <div key={order.id} className="bg-card border border-border p-6 rounded-3xl space-y-5 shadow-xl group hover:border-accent/30 transition-all">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Hash size={10} className="stroke-[3]" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{order.id.replace('#', '')}</span>
                  </div>
                  <h4 className="text-base font-black uppercase tracking-tight">{order.product}</h4>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${order.bg} border border-${order.color.split('-')[1]}/20`}>
                  <order.icon size={12} className={order.color} />
                  <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${order.color}`}>{order.status}</span>
                </div>
              </div>
              
              <div className="pt-5 border-t border-border flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none">Category</span>
                  <span className="text-xs font-black uppercase">{order.game}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none">Price</span>
                  <span className="text-base font-black text-white tracking-tighter">{order.price}</span>
                </div>
              </div>
              <div className="flex items-center justify-between opacity-50">
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">{order.date}</p>
                <button className="text-[9px] font-black uppercase tracking-widest hover:text-accent transition-colors">Details</button>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}