'use client';

import { useMemo, useCallback } from "react";
import { Home, Wallet, ClipboardList, UserCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase/auth/use-user";

/**
 * BottomNav - Performance Refactored
 * Optimized for zero-latency first interaction.
 */
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, initialized } = useUser();

  const NAV_ITEMS = useMemo(() => {
    return [
      { label: "Home", icon: Home, href: "/" },
      { label: "Wallet", icon: Wallet, href: "/wallet" },
      { label: "Orders", icon: ClipboardList, href: "/orders" },
      { 
        label: !initialized || user ? "Account" : "Login", 
        icon: !initialized || user ? UserCircle : LogIn, 
        href: initialized && !user ? "/login" : "/profile",
      },
    ];
  }, [user, initialized]);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Tracking navigation start to measure perceived latency
    (window as any).__nav_click_time = performance.now();
    
    // Manual push to bypass any potential Link component internal lag on first mount
    // but we still allow the default behavior of Link if it's already hydrated.
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border h-16 safe-area-bottom transform-gpu">
      <div className="flex h-full items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.label === "Account" && pathname.startsWith("/profile"));
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              prefetch={false}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative active-press nav-item",
                isActive ? "text-primary" : "text-muted-foreground hover:text-white"
              )}
              onClick={(e) => handleNavClick(e, item.href)}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform", 
                isActive && "fill-primary/10"
              )} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_#DC2626]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
