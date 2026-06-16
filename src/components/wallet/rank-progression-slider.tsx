
'use client';

import React, { useMemo, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { DEFAULT_RANKS, type RankDefinition, getRankFromSpend } from '@/lib/ranks';
import { cn } from '@/lib/utils';
import { ShieldCheck, Lock, CheckCircle2, Star, Crown, ChevronRight, ChevronLeft, Zap } from 'lucide-react';

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
    <section className="space-y-4 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 bg-primary rounded-full shadow-[0_0_8px_#DC2626]" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Membership Tiers</h3>
        </div>
        <div className="bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg flex items-center gap-2">
           <ChevronLeft size={6} className="text-white/20" />
           <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Swipe Protocol</span>
           <ChevronRight size={6} className="text-white/20" />
        </div>
      </div>

      <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex px-4 gap-3">
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
    <div className="flex-[0_0_80%] sm:flex-[0_0_300px] min-w-0 select-none">
      <Card className={cn(
        "bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl relative transition-all duration-500",
        isCurrent ? "ring-1 ring-primary/40 shadow-primary/10 scale-100" : "opacity-40 scale-95",
      )}>
        {/* Floating Discount Badge - TOP RIGHT */}
        <div className="absolute top-0 right-0 z-20">
           <div className="bg-primary px-3 py-1.5 rounded-bl-[1.5rem] border-l border-b border-white/10 shadow-xl">
              <span className="text-[9px] font-black text-white uppercase tracking-tighter">{rank.discount}% OFF</span>
           </div>
        </div>

        {/* Floating Rank Emblem - TOP RIGHT (Large) */}
        <div className={cn(
          "absolute top-6 right-6 z-10 opacity-20 pointer-events-none transition-all duration-700",
          isCurrent && "opacity-60 scale-125"
        )} style={{ color: rank.color }}>
           {isImmortal ? <Crown size={64} className="fill-current" /> : <Star size={64} className="fill-current" />}
        </div>

        <CardContent className="p-5 space-y-4 relative z-10">
          {/* Header Row */}
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <h4 className="text-sm font-black uppercase tracking-tight text-white leading-none">{rank.name}</h4>
              <div className="flex items-center gap-1.5">
                 {isUnlocked ? (
                   <CheckCircle2 size={9} className="text-green-500" />
                 ) : (
                   <Lock size={9} className="text-muted-foreground" />
                 )}
                 <span className={cn(
                   "text-[7px] font-black uppercase tracking-widest",
                   isCurrent ? "text-primary" : (isUnlocked ? "text-green-500" : "text-muted-foreground")
                 )}>
                   {isCurrent ? 'Current Tier' : (isUnlocked ? 'Unlocked' : 'Requirement')}
                 </span>
              </div>
            </div>
          </div>

          {/* Progress Section - Middle */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <p className="text-[9px] font-black text-white uppercase">Min Spend: ₹{rank.threshold.toLocaleString()}</p>
              <span className="text-[9px] font-black text-primary tracking-tighter">{progressPercent}%</span>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Progress value={progressPercent} className="h-1 bg-white/5 rounded-full" />
                {isUnlocked && <div className="absolute inset-0 bg-green-500/10 blur-sm rounded-full pointer-events-none" />}
              </div>
              <p className="text-[8px] font-black text-white/40 text-left uppercase tracking-[0.1em]">
                ₹{lifetimeSpend.toLocaleString()} / ₹{rank.threshold.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Benefits - Bottom (Limited to 2) */}
          <div className="pt-3 border-t border-white/5 flex gap-4">
            {rank.benefits.slice(0, 2).map((benefit, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                <Zap size={8} className="text-primary fill-primary" />
                <span className="text-[8px] font-bold text-white/70 uppercase tracking-tighter whitespace-nowrap">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>

        {/* Decorative Watermark */}
        {isUnlocked && (
          <div className="absolute -bottom-6 -right-6 opacity-[0.03] pointer-events-none -rotate-12">
            <ShieldCheck size={120} />
          </div>
        )}
      </Card>
    </div>
  );
}
