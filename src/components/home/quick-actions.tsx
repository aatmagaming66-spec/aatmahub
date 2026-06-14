"use client"

import { Wallet, Package, Headphones } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <section className="px-4 py-6 relative z-30">
      <div className="grid grid-cols-3 gap-3">
        <Link href="/dashboard" className="flex flex-col items-center justify-center bg-card p-4 rounded-2xl border border-border shadow-lg transition-all active:scale-95 hover:border-accent/30 group">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[10px] font-black text-center uppercase tracking-widest">Top-Up</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center justify-center bg-card p-4 rounded-2xl border border-border shadow-lg transition-all active:scale-95 hover:border-accent/30 group">
          <div className="h-10 w-10 bg-accent/10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Package className="h-5 w-5 text-accent" />
          </div>
          <span className="text-[10px] font-black text-center uppercase tracking-widest">Orders</span>
        </Link>
        <button className="flex flex-col items-center justify-center bg-card p-4 rounded-2xl border border-border shadow-lg transition-all active:scale-95 hover:border-accent/30 group">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Headphones className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[10px] font-black text-center uppercase tracking-widest">Support</span>
        </button>
      </div>
    </section>
  );
}