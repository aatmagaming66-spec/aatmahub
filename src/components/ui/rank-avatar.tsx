'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface RankAvatarProps {
  src?: string;
  fallback?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * Standardized User Avatar
 * Removed all membership-related tiered borders.
 */
export function RankAvatar({ src, fallback, className, size = 'md' }: RankAvatarProps) {
  const sizes = {
    'xs': 'h-6 w-6',
    'sm': 'h-8 w-8',
    'md': 'h-10 w-10',
    'lg': 'h-14 w-14',
    'xl': 'h-20 w-20',
    '2xl': 'h-24 w-24'
  };

  return (
    <div className={cn("relative inline-block shrink-0", className)}>
      <Avatar className={cn(sizes[size], "transition-all duration-500 bg-black/60 rounded-full overflow-hidden shadow-2xl")}>
        {src && <AvatarImage src={src} className="object-cover h-full w-full" />}
        <AvatarFallback className="bg-gradient-to-br from-white/10 to-transparent text-white font-black uppercase text-center leading-none w-full h-full flex items-center justify-center">
          {fallback || '?'}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
