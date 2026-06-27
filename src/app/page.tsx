
"use client"

import { useEffect, useMemo } from "react";
import { HeroBanner } from "@/components/home/hero-banner";
import { QuickActions } from "@/components/home/quick-actions";
import { GameGrid } from "@/components/home/game-grid";
import { ServiceCarousel } from "@/components/home/service-carousel";
import { LiveActivity } from "@/components/home/live-activity";
import { Send, Instagram, Facebook, Mail, ShieldCheck, Globe, Headphones } from "lucide-react";
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

      {/* Redesigned Footer matching ClassySmile Style */}
      <footer className="bg-[#0f111a] border-t border-white/5 pt-12 pb-24 px-6 mt-8">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          
          {/* Logo / Branding */}
          <div className="mb-8 flex flex-col items-center">
            <Link href="/" className="inline-block">
               <div className="relative group text-center">
                  <span className="font-headline font-black text-3xl tracking-tighter uppercase text-white flex items-center gap-1">
                    <span className="text-[#dc2626]">aatma</span>
                    <span className="text-white">hub</span>
                  </span>
                  <div className="absolute -top-6 -right-4">
                    <div className="h-10 w-10 flex items-center justify-center opacity-20">
                       <ShieldCheck className="text-[#dc2626]" size={40} />
                    </div>
                  </div>
               </div>
            </Link>
          </div>

          {/* Social Icons Grid */}
          <div className="flex items-center gap-6 mb-10">
            <a href={socialLinks.whatsapp} target="_blank" className="text-white hover:text-[#dc2626] transition-colors">
              <WhatsAppIcon className="h-7 w-7" />
            </a>
            <a href={socialLinks.instagram} target="_blank" className="text-white hover:text-[#dc2626] transition-colors">
              <Instagram className="h-7 w-7" />
            </a>
            <a href="#" className="text-white hover:text-[#dc2626] transition-colors">
              <Facebook className="h-7 w-7" />
            </a>
            <a href={`mailto:${siteSettings?.contactEmail || 'shivatetz@gmail.com'}`} className="text-white hover:text-[#dc2626] transition-colors">
              <Mail className="h-7 w-7" />
            </a>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/10 mb-10" />

          {/* 2-Column Links Grid */}
          <div className="w-full grid grid-cols-2 gap-x-8 gap-y-4 mb-12">
            <div className="flex flex-col space-y-4 text-left">
              <Link href="/" className="text-sm font-bold text-white hover:text-[#dc2626] transition-colors">Home</Link>
              <Link href="/login" className="text-sm font-bold text-white hover:text-[#dc2626] transition-colors">Login</Link>
              <Link href="/register" className="text-sm font-bold text-white hover:text-[#dc2626] transition-colors">Register</Link>
              <Link href="/support" className="text-sm font-bold text-white hover:text-[#dc2626] transition-colors">Customer Support</Link>
            </div>
            <div className="flex flex-col space-y-4 text-left">
              <Link href="/privacy" className="text-sm font-bold text-white hover:text-[#dc2626] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm font-bold text-white hover:text-[#dc2626] transition-colors">Terms & Conditions</Link>
              <Link href="/refund-policy" className="text-sm font-bold text-white hover:text-[#dc2626] transition-colors">Refund Policy</Link>
            </div>
          </div>

          {/* Final Divider */}
          <div className="w-full h-px bg-white/10 mb-8" />

          {/* Copyright */}
          <div className="text-center">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-loose">
              All Rights Reserved © 2025 | AATMA HUB
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
