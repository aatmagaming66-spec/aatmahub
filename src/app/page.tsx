
"use client"

import { useEffect, useMemo } from "react";
import { HeroBanner } from "@/components/home/hero-banner";
import { QuickActions } from "@/components/home/quick-actions";
import { GameGrid } from "@/components/home/game-grid";
import { ServiceCarousel } from "@/components/home/service-carousel";
import { ShieldCheck, Zap, Lock, Headphones, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useFirestore } from "@/firebase/provider";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";

declare global {
  interface Window {
    __nav_click_time?: number;
  }
}

export default function Home() {
  const db = useFirestore();

  // Real-time listeners for service collections
  const ottQuery = useMemo(() => query(collection(db, 'ott_services'), orderBy('sortOrder', 'asc')), [db]);
  const socialQuery = useMemo(() => query(collection(db, 'social_services'), orderBy('sortOrder', 'asc')), [db]);

  const { data: ottItems, loading: ottLoading } = useCollection(ottQuery);
  const { data: socialItems, loading: socialLoading } = useCollection(socialQuery);

  useEffect(() => {
    const mountTime = performance.now();
    if (window.__nav_click_time) {
      const duration = mountTime - window.__nav_click_time;
      console.log(`[PERF_HUB] Homepage Navigation Load: ${duration.toFixed(2)}ms ${duration > 1000 ? '⚠️ SLOW' : '✅ OK'}`);
      window.__nav_click_time = undefined;
    }
  }, []);

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      <HeroBanner />
      
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
      
      {/* Mobile Games Grid (Internal Firestore Fetch) */}
      <GameGrid />

      {/* OTT Services Carousel */}
      {ottLoading ? (
        <div className="px-4 py-10 flex justify-center"><Loader2 className="animate-spin text-accent" /></div>
      ) : (
        <ServiceCarousel title="OTT Services" items={ottItems} />
      )}

      {/* Social Services Carousel */}
      {socialLoading ? (
        <div className="px-4 py-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <ServiceCarousel title="Social Services" items={socialItems} />
      )}

      <footer className="px-6 py-10 mt-4 border-t border-border bg-background flex flex-col items-center text-center">
        <h2 className="text-4xl font-headline font-black tracking-tighter uppercase bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3 leading-none">
          AATMA HUB
        </h2>
        
        <div className="space-y-1 mb-6">
          <p className="text-[10px] font-bold text-white uppercase tracking-wider opacity-90">
            Premium Digital Solutions for Gaming and Social Needs.
          </p>
          <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">
            © 2024 Aatma HUB. All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-4 mb-8 text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <span className="text-border opacity-30">•</span>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <span className="text-border opacity-30">•</span>
          <Link href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link>
          <span className="text-border opacity-30">•</span>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">
            Developed by
          </p>
          <p className="text-[14px] font-black text-primary/40 uppercase tracking-[0.5em] leading-none">
            AATMA OFFICIAL
          </p>
        </div>
      </footer>
    </div>
  );
}
