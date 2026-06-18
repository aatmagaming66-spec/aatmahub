'use client';

import React, { useMemo, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { DEFAULT_RANKS, type RankDefinition, getRankFromSpend, getNextRank } from '@/lib/ranks';
import { cn } from '@/lib/utils';
import { 
  ShieldCheck, 
  Star, 
  Crown, 
  Zap,
  Ticket,
  CreditCard,
  Sparkles,
  Activity,
  Trophy,
  ArrowRight,
  Info
} from 'lucide-react';

interface RankProgressionSliderProps {
  lifetimeSpend: number;
  ranks?: RankDefinition[];
}

export function RankProgressionSlider({ lifetimeSpend, ranks = DEFAULT_RANKS }: RankProgressionSliderProps) {
  const safeRanks = Array.isArray(ranks) && ranks.length > 0 ? ranks : DEFAULT_RANKS;
  const sortedRanks = useMemo(() => [...safeRanks].sort((a, b) => a.sortOrder - b.sortOrder), [safeRanks]);
  const currentRank = useMemo(() => getRankFromSpend(lifetimeSpend, safeRanks), [lifetimeSpend, safeRanks]);
  const nextRank = useMemo(() => getNextRank(lifetimeSpend, safeRanks), [lifetimeSpend, safeRanks]);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps',
    loop: false,
  });

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (emblaApi && isMounted) {
      const currentIndex = sortedRanks.findIndex(r => r.id === currentRank.id);
      if (currentIndex !== -1) {
        emblaApi.scrollTo(currentIndex, true);
      }
    }
  }, [emblaApi, currentRank, sortedRanks, isMounted]);

  const expiryDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }, []);

  return (
    <section className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 bg-primary rounded-none shadow-[0_0_8px_#DC2626]" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Upgrade Center</h3>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[7px] font-black uppercase text-white/30 tracking-widest">Membership Expires:</span>
           <span className="text-[8px] font-black text-green-500 uppercase">{expiryDate}</span>
        </div>
      </div>

      {nextRank && (
        <div className="mx-2 p-4 bg-white/5 border border-white/5 rounded-none flex items-center justify-between shadow-lg">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-none bg-primary/10 flex items-center justify-center text-primary">
                 <Sparkles size={16} />
              </div>
              <div>
                 <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Next Level</p>
                 <p className="text-xs font-black text-white uppercase tracking-tight">{nextRank.name}</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[9px] font-black text-primary uppercase">₹{(nextRank.threshold - lifetimeSpend).toLocaleString()} Needed</p>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                 <span className="text-[7px] font-black text-white/40 uppercase">Upgrade for {nextRank.discount}% Discount</span>
                 <ArrowRight size={8} className="text-primary" />
              </div>
           </div>
        </div>
      )}

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

      <div className="mx-2 bg-primary/5 p-4 rounded-none border border-primary/10 flex gap-3">
         <Info size={14} className="text-primary shrink-0" />
         <p className="text-[9px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
           Membership levels are calculated based on your total lifetime spending. Discounts are automatically applied at checkout for all members.
         </p>
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

  const isHighTier = rank.name?.toLowerCase().includes('immortal') || rank.name?.toLowerCase().includes('glory') || rank.name?.toLowerCase().includes('mythic');

  return (
    <Card className={cn(
      "bg-card border-border rounded-none overflow-hidden shadow-2xl relative transition-all duration-500 min-h-[180px]",
      isCurrent ? "ring-1 ring-primary/40 scale-100" : "opacity-40 scale-95",
    )}>
      <div className={cn(
        "absolute -bottom-6 -right-6 z-0 opacity-10 pointer-events-none transition-all duration-1000",
        isCurrent && "opacity-20 scale-125 rotate-12"
      )} style={{ color: rank.color }}>
         {isHighTier ? <Crown size={160} className="fill-current" /> : <Star size={160} className="fill-current" />}
      </div>

      <CardContent className="p-6 space-y-6 relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
              {rank.name}
            </h4>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-none border",
                isCurrent ? "bg-primary text-white border-primary" : (isUnlocked ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-white/5 text-white/30 border-white/10")
              )}>
                {isCurrent ? 'Active Level' : (isUnlocked ? 'Unlocked' : 'Locked')}
              </span>
            </div>
          </div>
          
          <div className="h-12 w-12 rounded-none bg-white/5 flex items-center justify-center border border-white/10 shadow-xl" style={{ color: rank.color }}>
             {isHighTier ? <Crown size={24} className="fill-current" /> : <Trophy size={24} />}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div className="space-y-0.5">
               <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Target Progress</p>
               <p className="text-sm font-black text-white tracking-tight uppercase">
                  ₹{lifetimeSpend.toLocaleString()} / ₹{rank.threshold.toLocaleString()}
               </p>
            </div>
            <span className="text-lg font-black text-primary tracking-tighter">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5 bg-white/5 rounded-none" />
        </div>

        <div className="flex gap-2">
           <div className="bg-white/5 border border-white/10 rounded-none px-2 py-1 flex items-center gap-1.5">
              <Ticket size={10} className="text-primary" />
              <span className="text-[8px] font-black uppercase text-white/80">{rank.discount}% Store Discount</span>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RankBenefitsList({ rank, isUnlocked }: { rank: RankDefinition, isUnlocked: boolean }) {
  const b = rank.detailedBenefits;
  const BENEFIT_ITEMS = [
    { icon: Ticket, label: 'Order Discount', value: b.discount },
    { icon: CreditCard, label: 'Cashback Rate', value: b.cashback },
    { icon: Zap, label: 'Processing Priority', value: b.priority },
    { icon: Sparkles, label: 'Exclusive Offers', value: b.promotions },
    { icon: Activity, label: 'Security Status', value: b.accessLevel },
  ];

  return (
    <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-700">
      <div className="flex items-center gap-2 px-1 mb-1">
        <ShieldCheck size={10} className="text-primary" />
        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Tier Perks</span>
      </div>
      
      <div className="bg-card border border-white/5 rounded-none overflow-hidden shadow-2xl">
        {BENEFIT_ITEMS.map((item, idx) => (
          <div key={idx} className={cn("flex items-center justify-between p-4 border-b border-white/5 last:border-0", !isUnlocked && "opacity-40 grayscale")}>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-none bg-white/5 flex items-center justify-center text-primary"><item.icon size={14} /></div>
              <span className="text-[10px] font-bold uppercase tracking-tight text-white/80">{item.label}</span>
            </div>
            <span className={cn("text-[11px] font-black uppercase tracking-widest", isUnlocked ? "text-primary" : "text-white/20")}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
