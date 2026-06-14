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

      {/* Redesigned Minimal Footer */}
      <footer className="px-6 py-16 border-t border-border bg-background flex flex-col items-center text-center">
        <div className="mb-2">
          <h2 className="text-4xl font-headline font-black tracking-tighter uppercase bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AATMA HUB
          </h2>
        </div>
        
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-8 opacity-60">
          Premium Digital Solutions
        </p>

        <div className="flex items-center gap-3 mb-8">
          <button className="text-[9px] font-black text-white hover:text-primary transition-colors uppercase tracking-widest">Terms</button>
          <span className="text-border text-[8px]">•</span>
          <button className="text-[9px] font-black text-white hover:text-primary transition-colors uppercase tracking-widest">Privacy</button>
          <span className="text-border text-[8px]">•</span>
          <button className="text-[9px] font-black text-white hover:text-primary transition-colors uppercase tracking-widest">Refund Policy</button>
        </div>

        <div className="pt-8 border-t border-border/50 w-full max-w-[200px]">
          <p className="text-[8px] font-black text-primary/40 uppercase tracking-[0.3em]">
            Developed by Aatma Official
          </p>
        </div>
      </footer>
    </div>
  );
}
