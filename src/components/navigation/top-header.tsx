"use client"

import { ShoppingBag, User, Bell } from "lucide-react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border h-14">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-foreground hover:bg-white/5" />
          <Link href="/" className="font-headline font-bold text-lg tracking-tighter">
            <span className="text-primary">AATMA</span> <span className="text-foreground">HUB</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative hover:bg-white/5">
            <ShoppingBag className="h-5 w-5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
          </Button>
          <Link href="/account">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/5">
              <User className="h-5 w-5 text-foreground" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/5">
            <Bell className="h-5 w-5 text-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}