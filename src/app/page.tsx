
"use client"

import { useEffect, useMemo } from "react";
import { HeroBanner } from "@/components/home/hero-banner";
import { QuickActions } from "@/components/home/quick-actions";
import { GameGrid } from "@/components/home/game-grid";
import { ServiceCarousel } from "@/components/home/service-carousel";
import { LiveActivity } from "@/components/home/live-activity";
import { Send, Facebook, Instagram, ShieldCheck, MapPin, Globe, Headphones } from "lucide-react";
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
      showSocial: true,
      showLiveActivity: true,
      showTrustBadges: true,
    };
  }, [siteSettings]);

  const socialLinks = {
    instagram: siteSettings?.socialInstagram || "#",
    telegram: siteSettings?.socialTelegram || "https://t.me/aatmaplays",
    whatsapp: siteSettings?.contactWhatsApp ? `https://wa.me/${siteSettings.contactWhatsApp.replace(/\D/g, '')}` : "https://wa.me/918566936666"
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700 page-shell">
      <HeroBanner />
      
      <div className="mt-4">
        <QuickActions />
      </div>
      
      {homepageConfig.showGames && <GameGrid />}
      
      {homepageConfig.showSocial && (
        <div className="bg-gradient-to-b from-transparent via-primary/5 to-transparent">
          <ServiceCarousel title="Social Services Hub" category="Social Services" />
        </div>
      )}
      
      {homepageConfig.showLiveActivity && <LiveActivity />}

      <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 px-4 md:px-8 mt-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Branding Column */}
            <div className="lg:col-span-1 space-y-6">
              <Link href="/" className="inline-block group">
                <span className="font-headline font-black text-3xl tracking-tighter uppercase text-white">
                  <span className="text-primary">AATMA</span> HUB
                </span>
              </Link>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60">
                Premium Digital Solutions for Gaming and Social Growth. India's Most Trusted MLBB Diamond specialized distribution protocol.
              </p>
              <div className="flex items-center gap-3">
                <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="h-10 w-10 bg-white/5 border border-white/10 flex items-center justify-center rounded-lg hover:border-primary/50 hover:bg-primary/10 transition-all text-white/40 hover:text-primary">
                  <Send size={16} />
                </a>
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="h-10 w-10 bg-white/5 border border-white/10 flex items-center justify-center rounded-lg hover:border-primary/50 hover:bg-primary/10 transition-all text-white/40 hover:text-primary">
                  <Instagram size={16} />
                </a>
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="h-10 w-10 bg-white/5 border border-white/10 flex items-center justify-center rounded-lg hover:border-primary/50 hover:bg-primary/10 transition-all text-white/40 hover:text-primary">
                  <WhatsAppIcon className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Services Column */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Store Front</h3>
              <ul className="space-y-4">
                {[
                  { label: "MLBB India", href: "/product/mlbb-india" },
                  { label: "MLBB Global", href: "/product/mlbb-global" },
                  { label: "HOK Topup", href: "/product/honor-of-kings" },
                  { label: "Social Services", href: "/social-services" },
                  { label: "ID Checker", href: "/id-checker" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2">
                      <div className="w-1 h-1 bg-primary rounded-full" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account Column */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Account Hub</h3>
              <ul className="space-y-4">
                {[
                  { label: "Member Profile", href: "/profile" },
                  { label: "Order Registry", href: "/orders" },
                  { label: "Wallet Balance", href: "/wallet" },
                  { label: "Support Center", href: "/support" },
                  { label: "About HUB", href: "/about-us" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2">
                      <div className="w-1 h-1 bg-primary rounded-full" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Column */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Compliance</h3>
              <ul className="space-y-4">
                {[
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Refund Policy", href: "/refund-policy" },
                  { label: "Secure Payment", href: "/wallet/deposit" },
                  { label: "Contact Us", href: "/contact" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2">
                      <div className="w-1 h-1 bg-primary rounded-full" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Verified Hub Protocol</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Secured SSL Connection</span>
              </div>
              <div className="flex items-center gap-2">
                <Headphones size={16} className="text-accent" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">24/7 Digital Support</span>
              </div>
            </div>
            
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              © 2026 AATMA HUB • ALL RIGHTS RESERVED
            </p>
          </div>

          <div className="mt-16 text-center">
            <span className="text-[20px] font-black uppercase tracking-[0.6em] text-white/5 block select-none pointer-events-none">
              AATMA OFFICIAL
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
