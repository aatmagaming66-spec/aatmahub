"use client"

import { HeroBanner } from "@/components/home/hero-banner";
import { QuickActions } from "@/components/home/quick-actions";
import { GameGrid } from "@/components/home/game-grid";
import { ServiceCarousel } from "@/components/home/service-carousel";
import { ShieldCheck, Zap, Lock, Headphones } from "lucide-react";

const OTT_SERVICES = [
  { id: "netflix", name: "Netflix Premium", imgId: "ott-netflix" },
  { id: "prime", name: "Amazon Prime", imgId: "ott-prime" },
  { id: "yt-prem", name: "YouTube Premium", imgId: "ott-yt" },
  { id: "spotify", name: "Spotify Premium", imgId: "ott-spotify" },
];

const SOCIAL_SERVICES = [
  { id: "ig-serv", name: "Instagram", imgId: "social-ig" },
  { id: "fb-serv", name: "Facebook", imgId: "social-fb" },
  { id: "tg-serv", name: "Telegram", imgId: "social-fb" },
  { id: "yt-serv", name: "YouTube", imgId: "ott-yt" },
];

export default function Home() {
  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      <HeroBanner />
      <QuickActions />
      
      <GameGrid />
      
      <ServiceCarousel title="OTT Services" items={OTT_SERVICES} />
      
      <ServiceCarousel title="Social Services" items={SOCIAL_SERVICES} />

      {/* Trust Section */}
      <section className="px-6 py-10 bg-card mt-8 border-y border-border">
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h4 className="text-[9px] font-black uppercase tracking-widest text-foreground">Secure Payments</h4>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-accent/10 rounded-2xl border border-accent/20">
              <Zap className="h-6 w-6 text-accent" />
            </div>
            <h4 className="text-[9px] font-black uppercase tracking-widest text-foreground">Instant Delivery</h4>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-[9px] font-black uppercase tracking-widest text-foreground">Safe & Trusted</h4>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Headphones className="h-6 w-6 text-primary" />
            </div>
            <h4 className="text-[9px] font-black uppercase tracking-widest text-foreground">24/7 Support</h4>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 pt-12 pb-24 border-t border-border bg-background">
        <div className="mb-8">
          <h2 className="text-2xl font-headline font-black tracking-tighter mb-2">
            <span className="text-primary">AATMA</span> HUB
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs font-medium">
            Global Digital Marketplace providing premium access to gaming assets and entertainment services since 2023.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50">Policies</h3>
            <div className="flex flex-col gap-2">
              <button className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors text-left uppercase">Terms</button>
              <button className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors text-left uppercase">Privacy</button>
              <button className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors text-left uppercase">Refund</button>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50">Company</h3>
            <div className="flex flex-col gap-2">
              <button className="text-xs font-bold text-muted-foreground hover:text-accent transition-colors text-left uppercase">About Us</button>
              <button className="text-xs font-bold text-muted-foreground hover:text-accent transition-colors text-left uppercase">Contact</button>
              <button className="text-xs font-bold text-muted-foreground hover:text-accent transition-colors text-left uppercase">Partners</button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col items-center gap-2">
          <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">
            Developed by Aatma Official
          </p>
          <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">
            © 2024 AATMA HUB. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}