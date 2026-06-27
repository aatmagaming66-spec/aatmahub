
'use client';

import { useMemo, useCallback } from "react";
import { Home, Search, Headphones, UserCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase/auth/use-user";

/**
 * BottomNav - Performance Refactored to match ClassySmile Style
 * Optimized for zero-latency interaction with the specific purple design.
 */
export function BottomNav() {
  const pathname = usePathname();
  const { user, initialized } = useUser();

  const NAV_ITEMS = useMemo(() => {
    return [
      { label: "Home", icon: Home, href: "/" },
      { label: "Search", icon: Search, href: "/games" },
      { label: "Support", icon: Headphones, href: "/support" },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#4c1d95] h-[72px] safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex h-full items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.label === "Account" && pathname.startsWith("/profile"));
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 relative",
                isActive ? "text-white" : "text-white/60 hover:text-white"
              )}
              onClick={handleNavClick}
            >
              <item.icon className={cn(
                "h-6 w-6 transition-transform", 
                isActive && "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
              )} />
              <span className="text-[10px] font-bold uppercase tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-8 h-1 bg-white rounded-t-full shadow-[0_-2px_10px_white]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
