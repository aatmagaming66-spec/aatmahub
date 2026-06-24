"use client"

import { useEffect, useMemo } from "react";
import { HeroBanner } from "@/components/home/hero-banner";
import { QuickActions } from "@/components/home/quick-actions";
import { GameGrid } from "@/components/home/game-grid";
import { ServiceCarousel } from "@/components/home/service-carousel";
import { LiveActivity } from "@/components/home/live-activity";
import { ShieldCheck, Zap, Lock, Headphones, Send, Facebook, Instagram } from "lucide-react";
import Link from 'next/link';
import { useGlobalSettings } from "@/firebase/settings-context";

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.074 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
  </svg>
);

export default function Home() {
  const { siteSettings } = useGlobalSettings();

  useEffect(() => {
    const mountTime = performance.now();
    if ((window as any).__nav_click_time) {
      const duration = mountTime - (window as any).__nav_click_time;
      console.log(`[PERF] Navigation Load: ${duration.toFixed(2)}ms`);
      (window as any).__nav_click_time = undefined;
    }
  }, []);

  const homepageConfig = useMemo(() => {
    return siteSettings?.homepage || {
      showGames: true,
      showOtt: true,
      showSocial: true,
      showLiveActivity: true,
      showTrustBadges: true,
    };
  }, [siteSettings]);

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700 page-shell">
      <HeroBanner />
      
      {homepageConfig.showTrustBadges && (
        <section className="px-4 py-0.5 mt-4">
          <div className="grid grid-cols-4 gap-1.5">
            <div className="bg-card/40 backdrop-blur-md border border-primary/20 rounded-none h-[38px] flex flex-col items-center justify-center gap-0.5 shadow-sm">
              <div className="p-0.5 bg-primary/10 rounded-none">
                <Lock className="h-2.5 w-2.5 text-primary" />
              </div>
              <span className="text-[6px] font-black uppercase tracking-widest text-foreground/80">Secure</span>
            </div>
            
            <div className="bg-card/40 backdrop-blur-md border border-accent/20 rounded-none h-[38px] flex flex-col items-center justify-center gap-0.5 shadow-sm">
              <div className="p-0.5 bg-accent/10 rounded-none">
                <Zap className="h-2.5 w-2.5 text-accent" />
              </div>
              <span className="text-[6px] font-black uppercase tracking-widest text-foreground/80">Instant</span>
            </div>

            <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-none h-[38px] flex flex-col items-center justify-center gap-0.5 shadow-sm">
              <div className="p-0.5 bg-white/5 rounded-none">
                <ShieldCheck className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-[6px] font-black uppercase tracking-widest text-foreground/80">Trusted</span>
            </div>

            <div className="bg-card/40 backdrop-blur-md border border-primary/20 rounded-none h-[38px] flex flex-col items-center justify-center gap-0.5 shadow-sm">
              <div className="p-0.5 bg-primary/10 rounded-none">
                <Headphones className="h-2.5 w-2.5 text-primary" />
              </div>
              <span className="text-[6px] font-black uppercase tracking-widest text-foreground/80">Support</span>
            </div>
          </div>
        </section>
      )}
      
      <QuickActions />
      
      {homepageConfig.showGames && <GameGrid />}
      {homepageConfig.showOtt && <ServiceCarousel title="Premium OTT Plans" category="OTT Services" />}
      {homepageConfig.showSocial && <ServiceCarousel title="Social Growth Services" category="Social Services" />}
      {homepageConfig.showLiveActivity && <LiveActivity />}

      <footer className="bg-background border-t border-border pt-10 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24">
          {/* Column 1: Brand & Info - Centered on mobile, Left-aligned on large screens */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-5">
            <Link href="/" className="inline-block group active-press">
              <span className="font-headline font-black text-2xl tracking-tighter uppercase">
                <span className="text-primary">AATMA</span> HUB
              </span>
            </Link>
            <p className="text-[11px] font-medium text-muted-foreground leading-relaxed uppercase tracking-wider max-w-sm">
              Premium digital solutions for gaming and social needs. Fast, secure and trusted topup platform.
            </p>
            
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
              <a href="#" className="h-10 w-10 bg-white/5 border border-white/5 flex items-center justify-center rounded-none hover:border-primary/50 hover:bg-primary/10 transition-all group">
                <Send size={18} className="text-white group-hover:text-primary" />
              </a>
              <a href="#" className="h-10 w-10 bg-white/5 border border-white/5 flex items-center justify-center rounded-none hover:border-primary/50 hover:bg-primary/10 transition-all group">
                <Facebook size={18} className="text-white group-hover:text-primary" />
              </a>
              <a href="#" className="h-10 w-10 bg-white/5 border border-white/5 flex items-center justify-center rounded-none hover:border-primary/50 hover:bg-primary/10 transition-all group">
                <Instagram size={18} className="text-white group-hover:text-primary" />
              </a>
              <a href="#" className="h-10 w-10 bg-white/5 border border-white/5 flex items-center justify-center rounded-none hover:border-primary/50 hover:bg-primary/10 transition-all group">
                <DiscordIcon className="h-[18px] w-[18px] text-white group-hover:text-primary" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6 text-center lg:text-left">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Quick Links</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-8">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "#" },
                { label: "Contact Us", href: "/contact" },
                { label: "Support", href: "/contact" },
                { label: "Login", href: "/login" },
                { label: "Sign Up", href: "/register" },
                { label: "My Orders", href: "/orders" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms & Conditions", href: "/terms" },
                { label: "Refund Policy", href: "/refund-policy" },
              ].map((link) => (
                <Link 
                  key={link.label} 
                  href={link.href}
                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors flex items-center justify-center lg:justify-start gap-2 group"
                >
                  <div className="w-1 h-1 bg-white/10 rounded-full group-hover:bg-primary transition-colors" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
            © 2021 All Rights Reserved - Aatma HUB
          </p>
          
          <div className="flex flex-col items-center md:items-end gap-1">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">
              Designed & Developed By
            </p>
            <p className="text-[12px] font-black uppercase tracking-[0.3em] bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AATMA OFFICIAL
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
