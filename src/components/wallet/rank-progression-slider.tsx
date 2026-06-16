'use client';

import React, { useMemo, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { DEFAULT_RANKS, type RankDefinition, getRankFromSpend } from '@/lib/ranks';
import { cn } from '@/lib/utils';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Star, 
  Crown, 
  ChevronRight, 
  ChevronLeft, 
  Zap,
  Ticket,
  CreditCard,
  ZapIcon,
  Sparkles,
  Lock,
  ArrowUpCircle,
  Activity,
  Trophy
} from 'lucide-react';

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
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 bg-primary rounded-full shadow-[0_0_8px_#DC2626]" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Membership</h3>
        </div>
      </div>

      <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex px-4 gap-6">
          {sortedRanks.map((rank) => (
            <div key={rank.id} className="flex-[0_0_88%] sm:flex-[0_0_340px] min-w-0 select-none space-y-6">
              <RankCard 
                rank={rank} 
                lifetimeSpend={lifetimeSpend} 
                isCurrent={currentRank.id === rank.id}
                isUnlocked={lifetimeSpend >= rank.threshold}
              />
              <RankBenefitsList rank={rank} isUnlocked={lifetimeSpend >= rank.threshold} />
            </div>
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
    <Card className={cn(
      "bg-card border-border rounded-[22px] overflow-hidden shadow-2xl relative transition-all duration-500 min-h-[180px]",
      isCurrent ? "ring-2 ring-primary/40 shadow-primary/20 scale-100" : "opacity-40 scale-95",
    )}>
      {/* Premium Background Watermark */}
      <div className={cn(
        "absolute -bottom-6 -right-6 z-0 opacity-10 pointer-events-none transition-all duration-1000",
        isCurrent && "opacity-20 scale-125 rotate-12"
      )} style={{ color: rank.color }}>
         {isImmortal ? <Crown size={160} className="fill-current" /> : <Star size={160} className="fill-current" />}
      </div>

      <CardContent className="p-6 space-y-6 relative z-10 flex flex-col justify-between h-full">
        {/* TOP ROW: Rank Identity */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
              {rank.name}
            </h4>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border",
                isCurrent ? "bg-primary text-white border-primary" : (isUnlocked ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-white/5 text-white/30 border-white/10")
              )}>
                {isCurrent ? 'Current Tier' : (isUnlocked ? 'Unlocked' : 'Locked')}
              </span>
            </div>
          </div>
          
          <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-xl" style={{ color: rank.color }}>
             {isImmortal ? <Crown size={24} className="fill-current" /> : <Trophy size={24} />}
          </div>
        </div>

        {/* PROGRESS AREA */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div className="space-y-0.5">
               <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Progress</p>
               <p className="text-sm font-black text-white tracking-tight">
                  ₹{lifetimeSpend.toLocaleString()} <span className="text-white/20 mx-1">/</span> ₹{rank.threshold.toLocaleString()}
               </p>
            </div>
            <span className="text-lg font-black text-primary tracking-tighter">{progressPercent}%</span>
          </div>

          <div className="relative">
            <Progress value={progressPercent} className="h-2 bg-white/5 rounded-full" />
            {isUnlocked && <div className="absolute inset-0 bg-green-500/20 blur-md rounded-full pointer-events-none animate-pulse" />}
          </div>
        </div>

        {/* Value Chips Inside Card */}
        <div className="flex gap-2">
           <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 flex items-center gap-1.5">
              <Ticket size={10} className="text-primary" />
              <span className="text-[8px] font-black uppercase text-white/80">{rank.detailedBenefits.discount} OFF</span>
           </div>
           {isUnlocked && (
             <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-2 py-1 flex items-center gap-1.5">
                <CheckCircle2 size={10} className="text-green-500" />
                <span className="text-[8px] font-black uppercase text-green-500">Verified</span>
             </div>
           )}
        </div>
      </CardContent>
    </Card>
  );
}

function RankBenefitsList({ rank, isUnlocked }: { rank: RankDefinition, isUnlocked: boolean }) {
  const b = rank.detailedBenefits;
  
  const BENEFIT_ITEMS = [
    { icon: Ticket, label: 'Purchase Discount', value: b.discount },
    { icon: CreditCard, label: 'Wallet Cashback', value: b.cashback },
    { icon: ZapIcon, label: 'Priority Support', value: b.priority },
    { icon: Sparkles, label: 'Special Offers', value: b.promotions },
    { icon: ArrowUpCircle, label: 'Daily Bonus', value: b.limitBonus },
    { icon: Activity, label: 'Access Level', value: b.accessLevel },
  ];

  return (
    <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-700">
      <div className="flex items-center gap-2 px-1 mb-1">
        <ShieldCheck size={10} className="text-primary" />
        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Membership Benefits</span>
      </div>
      
      <div className="bg-[#111111] border border-white/5 rounded-[16px] overflow-hidden shadow-2xl">
        {BENEFIT_ITEMS.map((item, idx) => (
          <div 
            key={idx} 
            className={cn(
              "flex items-center justify-between p-4 border-b border-white/5 last:border-0 transition-colors",
              !isUnlocked && "opacity-40 grayscale"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <item.icon size={14} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight text-white/80">{item.label}</span>
            </div>
            <span className={cn(
              "text-[11px] font-black uppercase tracking-widest",
              isUnlocked ? "text-primary" : "text-white/20"
            )}>{item.value}</span>
          </div>
        ))}
      </div>
      
      {!isUnlocked && (
        <div className="flex items-center justify-center gap-2 py-2 bg-white/5 rounded-xl border border-dashed border-white/10">
          <Lock size={10} className="text-muted-foreground" />
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Unlock Rewards at ₹{rank.threshold.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
