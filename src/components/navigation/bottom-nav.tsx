'use client';

import { useEffect } from "react";
import { Home, LayoutDashboard, ClipboardList, UserCircle, LogIn, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase/auth/use-user";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();

  const NAV_ITEMS = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Orders", icon: ClipboardList, href: "/orders" },
    { 
      label: loading ? "Loading" : (user ? "Account" : "Login"), 
      icon: loading ? Loader2 : (user ? UserCircle : LogIn), 
      href: user ? "/profile" : "/login" 
    },
  ];

  // Aggressive route prefetching for instant navigation
  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border h-16 safe-area-bottom">
      <div className="flex h-full items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-accent"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5", 
                isActive && "fill-primary/10",
                item.label === "Loading" && "animate-spin"
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
