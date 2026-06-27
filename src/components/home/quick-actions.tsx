"use client"

import { Wallet, Search, Headphones, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function QuickActions() {
  const actions = [
    {
      href: "/wallet",
      label: "Top-Up",
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/10",
      glow: "shadow-primary/20",
    },
    {
      href: "/id-checker",
      label: "ID Checker",
      icon: Search,
      color: "text-accent",
      bgColor: "bg-accent/10",
      glow: "shadow-accent/20",
    },
    {
      href: "/support",
      label: "Support",
      icon: Headphones,
      color: "text-primary",
      bgColor: "bg-primary/10",
      glow: "shadow-primary/20",
    },
    {
      href: "/about-us",
      label: "About Us",
      icon: Info,
      color: "text-accent",
      bgColor: "bg-accent/10",
      glow: "shadow-accent/20",
    },
  ];

  return (
    <section className="px-4 py-2 relative z-30">
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, idx) => (
          <Link 
            key={idx}
            href={action.href} 
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-2xl transition-all active:scale-95 group relative overflow-hidden",
              "bg-gradient-to-br from-primary/[0.04] to-accent/[0.04] border border-white/5",
              "shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)]",
              "hover:border-primary/20 hover:from-primary/[0.08] hover:to-accent/[0.08]"
            )}
          >
            {/* 3D Icon Container */}
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center mb-1.5 transition-all duration-300",
              "bg-gradient-to-b from-white/10 to-transparent border-t border-white/10",
              "shadow-[0_4px_8px_rgba(0,0,0,0.5),inset_0_-1px_2px_rgba(0,0,0,0.4)]",
              "group-hover:scale-110 group-hover:-translate-y-0.5",
              action.bgColor
            )}>
              <action.icon className={cn(
                "h-5 w-5 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] transition-transform",
                action.color
              )} />
            </div>
            
            <span className="text-[8px] font-black text-center uppercase tracking-widest leading-none text-white/80 group-hover:text-white transition-colors">
              {action.label}
            </span>
            
            {/* Subtle bottom highlight for 3D depth */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </section>
  );
}
