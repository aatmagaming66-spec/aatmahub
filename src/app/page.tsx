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

      {/* Trust Features Section - Now part of Home Content */}
      <section className="px-4 py-2 mt-4">
        <div className="grid grid-cols-4 gap-2">
          {/* Card 1: Secure */}
          <div className="bg-card/40 backdrop-blur-md border border-primary/20 rounded-xl h-[70px] flex flex-col items-center justify-center gap-1 shadow-lg">
            <div className="p-1 bg-primary/10 rounded-lg">
              <Lock className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest text-foreground">Secure</span>
          </div>
          
          {/* Card 2: Instant */}
          <div className="bg-card/40 backdrop-blur-md border border-accent/20 rounded-xl h-[70px] flex flex-col items-center justify-center gap-1 shadow-lg">
            <div className="p-1 bg-accent/10 rounded-lg">
              <Zap className="h-3.5 w-3.5 text-accent" />
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest text-foreground">Instant</span>
          </div>

          {/* Card 3: Trusted */}
          <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl h-[70px] flex flex-col items-center justify-center gap-1 shadow-lg">
            <div className="p-1 bg-white/5 rounded-lg">
              <ShieldCheck className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest text-foreground">Trusted</span>
          </div>

          {/* Card 4: Support */}
          <div className="bg-card/40 backdrop-blur-md border border-primary/20 rounded-xl h-[70px] flex flex-col items-center justify-center gap-1 shadow-lg">
            <div className="p-1 bg-primary/10 rounded-lg">
              <Headphones className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest text-foreground">Support</span>
          </div>
        </div>
      </section>

      {/* Ultra Compact Premium Footer */}
      <footer className="px-6 pt-10 pb-12 mt-10 border-t border-border bg-background flex flex-col items-center text-center">
        <h2 className="text-4xl font-headline font-black tracking-tighter uppercase bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 leading-none">
          AATMA HUB
        </h2>
        <p className="text-[9px] font-bold text-white uppercase tracking-widest mb-6 opacity-80">
          Premium Digital Solutions for Gaming and Social Needs
        </p>

        <div className="flex items-center gap-4 mb-4 text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">
          <button className="hover:text-primary transition-colors">Terms</button>
          <span className="text-border opacity-30">•</span>
          <button className="hover:text-primary transition-colors">Privacy</button>
          <span className="text-border opacity-30">•</span>
          <button className="hover:text-primary transition-colors">Refund Policy</button>
        </div>

        <p className="text-[8px] font-black text-primary/40 uppercase tracking-[0.3em]">
          Developed by Aatma Official
        </p>
      </footer>
    </div>
  );
}
