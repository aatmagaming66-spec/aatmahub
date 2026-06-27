'use client';

import { useMemo, useCallback } from "react";
import { Home, Wallet, Package, UserCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase/auth/use-user";

/**
 * BottomNav - Restored original navigation items with Red Theme
 */
export function BottomNav() {
  const pathname = usePathname();
  const { user, initialized } = useUser();

  const NAV_ITEMS = useMemo(() => {
    return [
      { label: "Home", icon: Home, href: "/" },
      { label: "Wallet", icon: Wallet, href: "/wallet" },
      { label: "Orders", icon: Package, href: "/orders" },
      { 
        label: !initialized || user ? "Account" : "Login", 
        icon: !initialized || user ? UserCircle : LogIn, 
        href: initialized && !user ? "/login" : "/profile",
      },
    ];
  }, [user, initialized]);

  const handleNavClick = useCallback(() => {
    (window as any).__nav_click_time = performance.now();
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#dc2626] h-[60px] safe-area-bottom shadow-[0_-4px_20px_rgba(220,38,38,0.3)] border-t border-white/10">
      <div className="flex h-full items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.label === "Account" && pathname.startsWith("/profile"));
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-300 relative",
                isActive ? "text-white" : "text-white/60 hover:text-white"
              )}
              onClick={handleNavClick}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform", 
                isActive && "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
              )} />
              <span className="text-[9px] font-bold uppercase tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-0.5 w-6 h-0.5 bg-white rounded-t-full shadow-[0_-2px_12px_rgba(255,255,255,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
