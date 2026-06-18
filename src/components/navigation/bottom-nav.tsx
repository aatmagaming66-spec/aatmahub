'use client';

import { useEffect, useMemo } from "react";
import { Home, Wallet, ClipboardList, UserCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase/auth/use-user";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, initialized } = useUser();

  const NAV_ITEMS = useMemo(() => {
    const isProfileActive = pathname === "/profile" || pathname === "/login";
    
    return [
      { label: "Home", icon: Home, href: "/" },
      { label: "Wallet", icon: Wallet, href: "/wallet" },
      { label: "Orders", icon: ClipboardList, href: "/orders" },
      { 
        label: !initialized || user ? "Account" : "Login", 
        icon: !initialized || user ? UserCircle : LogIn, 
        href: initialized && !user ? "/login" : "/profile",
        isActive: isProfileActive
      },
    ];
  }, [user, initialized, pathname]);

  // AGGRESSIVE PREFETCH: Ensure navigation targets are pre-cached for zero-delay transition
  useEffect(() => {
    const prefetcher = () => {
      NAV_ITEMS.forEach((item) => {
        try {
          router.prefetch(item.href);
        } catch (e) {
          // silent fail
        }
      });
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(prefetcher, { timeout: 2000 });
      } else {
        setTimeout(prefetcher, 100);
      }
    }
  }, [NAV_ITEMS, router]);

  const handleTrackClick = (href: string) => {
    // Analytics timing mark
    if (typeof window !== 'undefined') {
      (window as any).__nav_click_time = performance.now();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border h-16 safe-area-bottom">
      <div className="flex h-full items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.isActive !== undefined ? item.isActive : pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              prefetch={true}
              onClick={() => handleTrackClick(item.href)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-white"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5", 
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
