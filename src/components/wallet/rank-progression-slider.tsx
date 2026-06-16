'use client';

import React, { useMemo, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { DEFAULT_RANKS, type RankDefinition, getRankFromSpend } from '@/lib/ranks';
import { cn } from '@/lib/utils';
import { ShieldCheck, Lock, CheckCircle2, Star, Crown, ChevronRight, ChevronLeft } from 'lucide-react';

interface RankProgressionSliderProps {
  lifetimeSpend: number;
  ranks?: RankDefinition[];
}

export function RankProgressionSlider({ lifetimeSpend, ranks = DEFAULT_RANKS }: RankProgressionSliderProps) {
  const sortedRanks = useMemo(() => [...ranks].sort((a, b) => a.sortOrder - b.sortOrder), [ranks]);
  const currentRank = useMemo(() => getRankFromSpend(lifetimeSpend, ranks), [lifetimeSpend, ranks]);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false,
    loop: false,
    skipSnaps: false,
  });

  // Auto-scroll to current rank on load
  useEffect(() => {
    if (emblaApi) {
      const currentIndex = sortedRanks.findIndex(r => r.id === currentRank.id);
      if (currentIndex !== -1) {
        emblaApi.scrollTo(currentIndex, true);
      }
    }
  }, [emblaApi, currentRank, sortedRanks]);

  return (
    <section className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 bg-primary rounded-full shadow-[0_0_10px_#DC2626]" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Rank Progression Center</h3>
        </div>
        <div className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg flex items-center gap-2">
           <ChevronLeft size={8} className="text-white/20" />
           <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Swipe Tiers</span>
           <ChevronRight size={8} className="text-white/20" />
        </div>
      </div>

      <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex px-4 gap-4">
          {sortedRanks.map((rank) => (
            <RankCard 
              key={rank.id} 
              rank={rank} 
              lifetimeSpend={lifetimeSpend} 
              isCurrent={currentRank.id === rank.id}
              isUnlocked={lifetimeSpend >= rank.threshold}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RankCard({ rank, lifetimeSpend, isCurrent, isUnlocked }: { 
  rank: RankDefinition; 
  lifetimeSpend: number; 
  isCurrent: boolean;
  isUnlocked: boolean;
}) {
  const progressPercent = useMemo(() => {
    if (rank.threshold === 0) return 100;
    return Math.min(100, Math.floor((lifetimeSpend / rank.threshold) * 100));
  }, [lifetimeSpend, rank.threshold]);

  const isImmortal = rank.id === 'immortal';

  return (
    <div className="flex-[0_0_85%] sm:flex-[0_0_320px] min-w-0 select-none">
      <Card className={cn(
        "bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl relative transition-all duration-500",
        isCurrent ? "ring-2 ring-primary/40 shadow-primary/20 scale-100" : "opacity-40 scale-90",
        isImmortal && isUnlocked && "animate-pulse"
      )}>
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5" style={{ color: rank.color }}>
                {isImmortal ? <Crown size={24} className="fill-current" /> : <Star size={24} className="fill-current" />}
              </div>
              <div>
                <h4 className="text-base font-black uppercase tracking-tight text-white">{rank.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                   {isUnlocked ? (
                     <CheckCircle2 size={10} className="text-green-500" />
                   ) : (
                     <Lock size={10} className="text-muted-foreground" />
                   )}
                   <span className={cn(
                     "text-[8px] font-black uppercase tracking-widest",
                     isCurrent ? "text-primary" : (isUnlocked ? "text-green-500" : "text-muted-foreground")
                   )}>
                     {isCurrent ? 'Current Tier' : (isUnlocked ? 'Requirement Met' : 'Rank Locked')}
                   </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
                <span className="text-[10px] font-black text-primary uppercase">{rank.discount}% OFF</span>
              </div>
            </div>
          </div>

          {/* Requirement Info */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Requirement</span>
                <p className="text-sm font-black text-white">Min. Spend: ₹{rank.threshold.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3 bg-black/40 p-4 rounded-3xl border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Your Progress</span>
                <span className="text-sm font-black text-primary tracking-tighter">{progressPercent}%</span>
              </div>
              <div className="relative">
                <Progress value={progressPercent} className="h-1.5 bg-white/5 rounded-full" />
                {isUnlocked && <div className="absolute inset-0 bg-green-500/20 blur-sm rounded-full pointer-events-none" />}
              </div>
              <p className="text-[9px] font-black text-white/60 text-center uppercase tracking-widest">
                ₹{lifetimeSpend.toLocaleString()} / ₹{rank.threshold.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Tier Benefits</span>
            {rank.benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-tight">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>

        {/* Decorative Watermark */}
        {isUnlocked && (
          <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none -rotate-12">
            <ShieldCheck size={100} />
          </div>
        )}
      </Card>
    </div>
  );
}
