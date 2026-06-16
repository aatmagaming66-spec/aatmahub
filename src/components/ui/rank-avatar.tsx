
'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Crown, Zap } from 'lucide-react';

interface RankAvatarProps {
  src?: string;
  fallback?: string;
  rank?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function RankAvatar({ src, fallback, rank = 'Warrior', className, size = 'md' }: RankAvatarProps) {
  const r = rank.toLowerCase();

  const getRankStyles = () => {
    if (r.includes('immortal')) return "border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.6)] animate-pulse";
    if (r.includes('glory')) return "border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]";
    if (r.includes('honor')) return "border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]";
    if (r.includes('mythic')) return "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]";
    if (r.includes('legend')) return "border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]";
    if (r.includes('epic')) return "border-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.3)]";
    if (r.includes('grandmaster')) return "border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.2)]";
    if (r.includes('master')) return "border-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.2)]";
    if (r.includes('elite')) return "border-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.2)]";
    return "border-slate-400 shadow-none";
  };

  const sizes = {
    'xs': 'h-6 w-6 border',
    'sm': 'h-8 w-8 border-2',
    'md': 'h-10 w-10 border-2',
    'lg': 'h-14 w-14 border-2',
    'xl': 'h-20 w-20 border-[3px]',
    '2xl': 'h-24 w-24 border-[4px]'
  };

  return (
    <div className={cn("relative inline-block shrink-0", className)}>
      <Avatar className={cn(sizes[size], "transition-all duration-500 bg-black/40", getRankStyles())}>
        <AvatarImage src={src} className="object-cover" />
        <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-[10px]">
          {fallback || rank.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      {/* Immortal Crown Overlay */}
      {r.includes('immortal') && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <Crown className="h-4 w-4 text-yellow-500 fill-yellow-500 filter drop-shadow-[0_0_5px_rgba(234,179,8,1)]" />
        </div>
      )}

      {/* Mythic Flame Icon Overlay */}
      {(r.includes('mythic') || r.includes('glory') || r.includes('honor')) && !r.includes('immortal') && (
        <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-0.5 border border-white/20 shadow-lg">
          <Zap className="h-2 w-2 text-white fill-white" />
        </div>
      )}
    </div>
  );
}
