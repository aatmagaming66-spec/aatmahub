
"use client"

import { HeroBanner } from "@/components/home/hero-banner";
import { QuickActions } from "@/components/home/quick-actions";
import { GameGrid } from "@/components/home/game-grid";
import { ServiceCarousel } from "@/components/home/service-carousel";
import { AiGiftMatcher } from "@/components/home/ai-gift-matcher";
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
    <div className="flex flex-col w-full animate-in fade-in duration-500">
      <HeroBanner />
      <QuickActions />
      
      <AiGiftMatcher />

      <GameGrid />
      
      <ServiceCarousel title="OTT Services" items={OTT_SERVICES} />
      
      <ServiceCarousel title="Social Services" items={SOCIAL_SERVICES} />

      {/* Trust Section */}
      <section className="px-6 py-8 bg-card/50 mt-4 border-t border-white/5">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col items-center text-center gap-2">
            <Lock className="h-6 w-6 text-primary" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Secure Payments</h4>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <Zap className="h-6 w-6 text-accent" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Instant Delivery</h4>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-400" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Safe & Trusted</h4>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <Headphones className="h-6 w-6 text-blue-400" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">24/7 Support</h4>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 pt-10 pb-24 border-t border-white/5 bg-background">
        <h2 className="text-xl font-headline font-bold text-primary mb-2">AATMA HUB</h2>
        <p className="text-xs text-muted-foreground mb-6 max-w-xs">
          Premium Digital Solutions for Gaming and Social Needs. Providing global access to premium assets since 2023.
        </p>
        
        <div className="flex gap-6 mb-8">
          <button className="text-[11px] font-bold text-muted-foreground hover:text-foreground">TERMS</button>
          <button className="text-[11px] font-bold text-muted-foreground hover:text-foreground">PRIVACY</button>
          <button className="text-[11px] font-bold text-muted-foreground hover:text-foreground">REFUND</button>
        </div>

        <div className="pt-6 border-t border-white/5">
          <p className="text-[10px] font-medium text-muted-foreground opacity-50">
            © 2024 AATMA HUB. DEVELOPED BY AATMA OFFICIAL
          </p>
        </div>
      </footer>
    </div>
  );
}
