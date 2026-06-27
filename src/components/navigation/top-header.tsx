"use client"

import { ShoppingCart, Bell, Menu, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function TopHeader() {
  const { totalCount } = useCart();
  const { toggleSidebar } = useSidebar();

  const MOCK_NOTIFICATIONS = [
    { id: 1, title: 'Identity Verified', desc: 'Your account security status is now active.', icon: ShieldCheck, color: 'text-green-400', time: '2m ago' },
    { id: 2, title: 'Deposit Success', desc: '₹500 has been credited to your hub wallet.', icon: CheckCircle2, color: 'text-primary', time: '1h ago' },
    { id: 3, title: 'System Optimized', desc: 'V2.1 protocols are now live for all regions.', icon: Zap, color: 'text-accent', time: '5h ago' },
  ];

  return (
    <header className="w-full bg-background/80 backdrop-blur-md border-b border-border h-16">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left Side: Text Identity */}
        <div className="flex items-center">
          <Link href="/" prefetch={false} className="flex items-center gap-2 group active-press">
            <span className="font-headline font-black text-2xl tracking-tighter uppercase">
              <span className="text-primary">AATMA</span> <span className="text-foreground">HUB</span>
            </span>
          </Link>
        </div>
        
        {/* Right Side: Actions & Menu with 3D Aesthetic */}
        <div className="flex items-center gap-3">
          <Link href="/cart" prefetch={false}>
            <div className={cn(
              "h-11 w-11 rounded-xl flex items-center justify-center transition-all active:scale-95 group relative overflow-hidden",
              "bg-gradient-to-br from-primary/[0.08] to-accent/[0.08] border border-white/10",
              "shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)]",
              "hover:border-primary/30"
            )}>
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-white/10 to-transparent border-t border-white/10 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.4)]">
                <ShoppingCart className="h-5 w-5 text-primary drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]" />
                {totalCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-primary rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-[0_0_8px_rgba(220,38,38,0.6)] border border-background">
                    {totalCount}
                  </span>
                )}
              </div>
            </div>
          </Link>
          
          <Popover>
            <PopoverTrigger asChild>
              <div className={cn(
                "h-11 w-11 rounded-xl flex items-center justify-center transition-all active:scale-95 group relative cursor-pointer overflow-hidden",
                "bg-gradient-to-br from-accent/[0.08] to-primary/[0.08] border border-white/10",
                "shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)]",
                "hover:border-accent/30"
              )}>
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-white/10 to-transparent border-t border-white/10 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.4)]">
                  <Bell className="h-5 w-5 text-accent drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]" />
                  <span className="absolute top-3 right-3 h-1.5 w-1.5 bg-accent rounded-full animate-pulse border border-background" />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="bg-card border-border w-80 p-0 overflow-hidden shadow-2xl rounded-2xl" align="end">
              <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Hub Notifications</h4>
              </div>
              <div className="max-h-[300px] overflow-y-auto no-scrollbar divide-y divide-white/5">
                 {MOCK_NOTIFICATIONS.map((n) => (
                   <div key={n.id} className="p-4 flex gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className={cn("h-10 w-10 shrink-0 rounded-xl bg-white/5 flex items-center justify-center border border-white/5", n.color)}>
                        <n.icon size={18} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-black uppercase text-white/90 group-hover:text-primary transition-colors">{n.title}</p>
                        <p className="text-[9px] text-muted-foreground uppercase leading-relaxed line-clamp-2">{n.desc}</p>
                        <p className="text-[7px] font-black text-white/20 uppercase pt-1">{n.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="p-3 bg-black/40 border-t border-white/5 text-center">
                 <Link href="/profile/notifications" className="text-[8px] font-black uppercase tracking-widest text-primary hover:underline">Manage Preferences</Link>
              </div>
            </PopoverContent>
          </Popover>

          <button 
            className={cn(
              "h-11 w-11 rounded-xl flex items-center justify-center transition-all active:scale-95 group relative overflow-hidden",
              "bg-gradient-to-br from-primary/[0.06] to-accent/[0.06] border border-white/10",
              "shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)]",
              "hover:border-white/20"
            )}
            onClick={toggleSidebar}
          >
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-white/5 to-transparent border-t border-white/10 shadow-[inset_0_-1px_1px_rgba(0,0,0,0.3)]">
              <Menu className="h-5 w-5 text-foreground drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
