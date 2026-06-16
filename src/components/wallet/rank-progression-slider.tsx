'use client';

import React, { useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { DEFAULT_RANKS, type RankDefinition, getRankFromSpend } from '@/lib/ranks';
import { cn } from '@/lib/utils';
import { ShieldCheck, Lock, CheckCircle2, Zap, Target, Star, Crown } from 'lucide-react';

interface RankProgressionSliderProps {
  lifetimeSpend: number;
  ranks?: RankDefinition[];
}

export function RankProgressionSlider({ lifetimeSpend, ranks = DEFAULT_RANKS }: RankProgressionSliderProps) {
  const [emblaRef] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const sortedRanks = useMemo(() => [...ranks].sort((a, b) => a.sortOrder - b.sortOrder), [ranks]);
  const currentRank = useMemo(() => getRankFromSpend(lifetimeSpend, ranks), [lifetimeSpend, ranks]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 bg-primary rounded-full shadow-[0_0_10px_#DC2626]" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Rank Progression Center</h3>
        </div>
        <div className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
           <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Swipe to explore</span>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 px-4">
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
  const progress = useMemo(() => {
    if (isUnlocked) return 100;
    // If it's the first rank (Warrior), it's always 100%
    if (rank.threshold === 0) return 100;
    return Math.min(99.9, Math.floor((lifetimeSpend / rank.threshold) * 100));
  }, [lifetimeSpend, rank.threshold, isUnlocked]);

  const isImmortal = rank.id === 'immortal';

  return (
    <div className="flex-[0_0_85%] sm:flex-[0_0_320px] min-w-0">
      <Card className={cn(
        "bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl relative transition-all duration-500",
        isCurrent ? "ring-2 ring-primary/40 shadow-primary/10" : "opacity-80 scale-95",
        isImmortal && isUnlocked && "animate-pulse"
      )}>
        <CardContent className="p-6 space-y-6">
          {/* Top Section: Header & Status */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5" style={{ color: rank.color }}>
                {isImmortal ? <Crown size={20} className="fill-current" /> : <Star size={20} className="fill-current" />}
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight text-white">{rank.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                   {isUnlocked ? (
                     <CheckCircle2 size={8} className="text-green-500" />
                   ) : (
                     <Lock size={8} className="text-muted-foreground" />
                   )}
                   <span className={cn(
                     "text-[7px] font-black uppercase tracking-widest",
                     isCurrent ? "text-primary" : (isUnlocked ? "text-green-500" : "text-muted-foreground")
                   )}>
                     {isCurrent ? 'Current Rank' : (isUnlocked ? 'Unlocked' : 'Locked')}
                   </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-primary uppercase">-{rank.discount}%</span>
              <p className="text-[7px] font-black text-muted-foreground uppercase tracking-tighter">Discount</p>
            </div>
          </div>

          {/* Middle Section: Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Requirement</span>
                <p className="text-xs font-black text-white">₹{lifetimeSpend.toLocaleString()} / ₹{rank.threshold.toLocaleString()}</p>
              </div>
              <span className="text-lg font-black text-primary tracking-tighter">{progress}%</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-2 bg-white/5 rounded-full" />
              {isCurrent && <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full pointer-events-none" style={{ width: `${progress}%` }} />}
            </div>
          </div>

          {/* Bottom Section: Benefits */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Rank Benefits</span>
            {rank.benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                <span className="text-[9px] font-bold text-white/70 uppercase tracking-tight">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>

        {/* Decorative Overlay for Current Rank */}
        {isCurrent && (
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <ShieldCheck size={80} />
          </div>
        )}
      </Card>
    </div>
  );
}
