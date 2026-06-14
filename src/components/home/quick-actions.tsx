
"use client"

import { Wallet, Package, Headphones } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <section className="px-4 -mt-6 relative z-30">
      <div className="grid grid-cols-3 gap-3">
        <Link href="/dashboard" className="flex flex-col items-center justify-center bg-card p-3 rounded-xl border border-white/5 shadow-xl transition-transform active:scale-95">
          <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[10px] font-semibold text-center uppercase tracking-wider">Top-Up</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center justify-center bg-card p-3 rounded-xl border border-white/5 shadow-xl transition-transform active:scale-95">
          <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
            <Package className="h-5 w-5 text-blue-400" />
          </div>
          <span className="text-[10px] font-semibold text-center uppercase tracking-wider">Orders</span>
        </Link>
        <button className="flex flex-col items-center justify-center bg-card p-3 rounded-xl border border-white/5 shadow-xl transition-transform active:scale-95">
          <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
            <Headphones className="h-5 w-5 text-green-400" />
          </div>
          <span className="text-[10px] font-semibold text-center uppercase tracking-wider">Support</span>
        </button>
      </div>
    </section>
  );
}
