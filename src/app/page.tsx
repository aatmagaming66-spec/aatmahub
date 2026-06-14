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

      {/* Redesigned Compact Trust Section */}
      <section className="px-4 py-2 mt-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
          <div className="flex-shrink-0 w-32 h-[80px] bg-card/40 backdrop-blur-md border border-primary/20 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-primary/5 group active:scale-95 transition-all">
            <div className="p-1.5 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground">Secure</span>
          </div>
          
          <div className="flex-shrink-0 w-32 h-[80px] bg-card/40 backdrop-blur-md border border-accent/20 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-accent/5 group active:scale-95 transition-all">
            <div className="p-1.5 bg-accent/10 rounded-lg group-hover:scale-110 transition-transform">
              <Zap className="h-4 w-4 text-accent" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground">Instant</span>
          </div>

          <div className="flex-shrink-0 w-32 h-[80px] bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg group active:scale-95 transition-all">
            <div className="p-1.5 bg-white/5 rounded-lg group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground">Trusted</span>
          </div>

          <div className="flex-shrink-0 w-32 h-[80px] bg-card/40 backdrop-blur-md border border-primary/20 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-primary/5 group active:scale-95 transition-all">
            <div className="p-1.5 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
              <Headphones className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground">Support</span>
          </div>
        </div>
      </section>

      {/* Redesigned Minimal Footer */}
      <footer className="px-6 py-12 mt-6 border-t border-border bg-background flex flex-col items-center text-center">
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