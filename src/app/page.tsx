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

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.397-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.131.57-.074 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
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
          {/* Column 1: Brand & Info */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-5">
            <Link href="/" className="inline-block group active-press">
              <span className="font-headline font-black text-2xl tracking-tighter uppercase">
                <span className="text-primary">AATMA</span> HUB
              </span>
            </Link>
            <p className="text-[11px] font-medium text-muted-foreground leading-relaxed uppercase tracking-wider max-w-sm">
              Aatma HUB is a trusted gaming topup and digital services platform providing fast, secure and affordable recharge solutions for gamers worldwide.
            </p>
            
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
              <a href="https://t.me/aatmaplays" target="_blank" rel="noopener noreferrer" className="h-10 w-10 bg-white/5 border border-white/5 flex items-center justify-center rounded-none hover:border-primary/50 hover:bg-primary/10 transition-all group">
                <Send size={18} className="text-white group-hover:text-primary" />
              </a>
              <a href="#" className="h-10 w-10 bg-white/5 border border-white/5 flex items-center justify-center rounded-none hover:border-primary/50 hover:bg-primary/10 transition-all group">
                <Facebook size={18} className="text-white group-hover:text-primary" />
              </a>
              <a href="#" className="h-10 w-10 bg-white/5 border border-white/5 flex items-center justify-center rounded-none hover:border-primary/50 hover:bg-primary/10 transition-all group">
                <Instagram size={18} className="text-white group-hover:text-primary" />
              </a>
              <a href="https://wa.me/918566936666" target="_blank" rel="noopener noreferrer" className="h-10 w-10 bg-white/5 border border-white/5 flex items-center justify-center rounded-none hover:border-primary/50 hover:bg-primary/10 transition-all group">
                <WhatsAppIcon className="h-[18px] w-[18px] text-white group-hover:text-primary" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links (Merged into single Quick Links) */}
          <div className="flex flex-col space-y-6">
            <div className="text-center lg:text-left">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-6">Quick Links</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                {[
                  { label: "Home", href: "/" },
                  { label: "About Us", href: "/about-us" },
                  { label: "Contact Us", href: "/contact" },
                  { label: "Support", href: "/support" },
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
                    className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors flex items-center justify-start gap-2 group"
                  >
                    <div className="w-1 h-1 bg-white/10 rounded-full group-hover:bg-primary transition-colors shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
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
