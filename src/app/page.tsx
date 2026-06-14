"use client"

import { HeroBanner } from "@/components/home/hero-banner";
import { QuickActions } from "@/components/home/quick-actions";
import { GameGrid } from "@/components/home/game-grid";
import { ServiceCarousel } from "@/components/home/service-carousel";
import { LiveActivity } from "@/components/home/live-activity";
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
      
      {/* Trust Badges Section */}
      <section className="px-4 py-0.5 mt-4">
        <div className="grid grid-cols-4 gap-1.5">
          <div className="bg-card/40 backdrop-blur-md border border-primary/20 rounded-lg h-[38px] flex flex-col items-center justify-center gap-0.5 shadow-sm">
            <div className="p-0.5 bg-primary/10 rounded-md">
              <Lock className="h-2.5 w-2.5 text-primary" />
            </div>
            <span className="text-[6px] font-black uppercase tracking-widest text-foreground/80">Secure</span>
          </div>
          
          <div className="bg-card/40 backdrop-blur-md border border-accent/20 rounded-lg h-[38px] flex flex-col items-center justify-center gap-0.5 shadow-sm">
            <div className="p-0.5 bg-accent/10 rounded-md">
              <Zap className="h-2.5 w-2.5 text-accent" />
            </div>
            <span className="text-[6px] font-black uppercase tracking-widest text-foreground/80">Instant</span>
          </div>

          <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-lg h-[38px] flex flex-col items-center justify-center gap-0.5 shadow-sm">
            <div className="p-0.5 bg-white/5 rounded-md">
              <ShieldCheck className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-[6px] font-black uppercase tracking-widest text-foreground/80">Trusted</span>
          </div>

          <div className="bg-card/40 backdrop-blur-md border border-primary/20 rounded-lg h-[38px] flex flex-col items-center justify-center gap-0.5 shadow-sm">
            <div className="p-0.5 bg-primary/10 rounded-md">
              <Headphones className="h-2.5 w-2.5 text-primary" />
            </div>
            <span className="text-[6px] font-black uppercase tracking-widest text-foreground/80">Support</span>
          </div>
        </div>
      </section>
      
      <QuickActions />
      
      <GameGrid />
      
      <ServiceCarousel title="OTT Services" items={OTT_SERVICES} />
      
      <ServiceCarousel title="Social Services" items={SOCIAL_SERVICES} />

      {/* Live Activity Feed */}
      <LiveActivity />

      {/* Ultra Compact Premium Footer */}
      <footer className="px-6 pt-10 pb-12 mt-4 border-t border-border bg-background flex flex-col items-center text-center">
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
