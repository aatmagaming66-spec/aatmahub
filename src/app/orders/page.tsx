
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Clock, CheckCircle2, XCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const ORDERS = [
  { id: "#AH-92381", product: "86 Diamonds", game: "MLBB India", price: "₹99", status: "Completed", date: "24 Feb 2024", icon: CheckCircle2, color: "text-green-400" },
  { id: "#AH-92380", product: "Weekly Pass", game: "Magic Chess", price: "₹159", status: "Processing", date: "23 Feb 2024", icon: Clock, color: "text-blue-400" },
  { id: "#AH-92379", product: "Netflix UHD", game: "OTT Premium", price: "₹499", status: "Pending", date: "22 Feb 2024", icon: Clock, color: "text-orange-400" },
  { id: "#AH-92378", product: "1000 Instagram Followers", game: "Social", price: "₹250", status: "Cancelled", date: "21 Feb 2024", icon: XCircle, color: "text-destructive" },
];

export default function OrdersPage() {
  return (
    <div className="flex flex-col w-full p-4 space-y-6 animate-in fade-in duration-500">
      <header className="py-2">
        <h1 className="text-2xl font-headline font-bold">MY ORDERS</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Track your digital assets</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search Order ID..." 
          className="bg-card border-white/5 pl-10 h-11"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full bg-card/50 border border-white/5 h-12 p-1 rounded-xl overflow-x-auto no-scrollbar justify-start">
          <TabsTrigger value="all" className="flex-shrink-0 text-[10px] font-black uppercase px-4">All</TabsTrigger>
          <TabsTrigger value="pending" className="flex-shrink-0 text-[10px] font-black uppercase px-4">Pending</TabsTrigger>
          <TabsTrigger value="processing" className="flex-shrink-0 text-[10px] font-black uppercase px-4">Processing</TabsTrigger>
          <TabsTrigger value="completed" className="flex-shrink-0 text-[10px] font-black uppercase px-4">Completed</TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-shrink-0 text-[10px] font-black uppercase px-4">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-3">
          {ORDERS.map((order) => (
            <div key={order.id} className="bg-card border border-white/5 p-4 rounded-2xl space-y-3 shadow-lg group active:bg-white/5 transition-colors">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-primary tracking-widest leading-none">{order.id}</span>
                  <h4 className="text-sm font-bold">{order.product}</h4>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 ${order.color}`}>
                  <order.icon size={12} />
                  <span className="text-[9px] font-black uppercase tracking-wider">{order.status}</span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Service</span>
                  <span className="text-xs font-bold">{order.game}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Amount</span>
                  <span className="text-xs font-black">{order.price}</span>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-widest">{order.date}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
