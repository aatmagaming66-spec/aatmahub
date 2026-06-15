
"use client"

import { ShoppingBag, User, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function TopHeader() {
  const { totalCount } = useCart();
  const logo = PlaceHolderImages.find(img => img.id === 'app-logo');

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border h-14">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-foreground hover:bg-white/5" />
          <Link href="/" className="flex items-center gap-2 group">
            {logo && (
              <Image 
                src={logo.imageUrl} 
                alt="AATMA Logo" 
                width={28} 
                height={28} 
                className="h-7 w-7 object-contain group-hover:scale-110 transition-transform"
              />
            )}
            <span className="font-headline font-bold text-lg tracking-tighter">
              <span className="text-primary">AATMA</span> <span className="text-foreground">HUB</span>
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-1">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative hover:bg-white/5">
              <ShoppingBag className="h-5 w-5 text-foreground" />
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-primary rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-[0_0_8px_rgba(220,38,38,0.5)] border border-background">
                  {totalCount}
                </span>
              )}
            </Button>
          </Link>
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
