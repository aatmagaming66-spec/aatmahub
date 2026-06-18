"use client"

import { Wallet, Package, Headphones, Search } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <section className="px-4 py-1.5 relative z-30">
      <div className="grid grid-cols-4 gap-2">
        <Link href="/dashboard" className="flex flex-col items-center justify-center bg-card p-1.5 rounded-xl border border-border shadow-lg transition-all active:scale-95 hover:border-accent/30 group">
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <span className="text-[8px] font-black text-center uppercase tracking-widest leading-none">Top-Up</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center justify-center bg-card p-1.5 rounded-xl border border-border shadow-lg transition-all active:scale-95 hover:border-accent/30 group">
          <div className="h-8 w-8 bg-accent/10 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <Package className="h-4 w-4 text-accent" />
          </div>
          <span className="text-[8px] font-black text-center uppercase tracking-widest leading-none">Orders</span>
        </Link>
        <button className="flex flex-col items-center justify-center bg-card p-1.5 rounded-xl border border-border shadow-lg transition-all active:scale-95 hover:border-accent/30 group">
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <Headphones className="h-4 w-4 text-primary" />
          </div>
          <span className="text-[8px] font-black text-center uppercase tracking-widest leading-none">Support</span>
        </button>
        <Link href="#" className="flex flex-col items-center justify-center bg-card p-1.5 rounded-xl border border-border shadow-lg transition-all active:scale-95 hover:border-accent/30 group">
          <div className="h-8 w-8 bg-accent/10 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <Search className="h-4 w-4 text-accent" />
          </div>
          <span className="text-[8px] font-black text-center uppercase tracking-widest leading-none">ID Checker</span>
        </Link>
      </div>
    </section>
  );
}
