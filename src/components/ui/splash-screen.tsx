
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fade out after 1.5 seconds
    const fadeTimer = setTimeout(() => setIsFading(true), 1500);
    // Remove component after fade animation completes (total 2.5s)
    const removeTimer = setTimeout(() => setIsVisible(false), 2500);
    
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  const logo = PlaceHolderImages.find(img => img.id === 'app-logo');

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-1000 ease-in-out",
        isFading ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="relative flex flex-col items-center gap-6">
        {/* Purple Glow Effect */}
        <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full animate-pulse scale-150" />
        
        <div className="relative z-10 animate-in zoom-in-50 duration-1000 ease-out">
          <Image 
            src={logo?.imageUrl || "https://picsum.photos/seed/aatma-logo/512/512"} 
            alt="AATMA HUB" 
            width={160} 
            height={160} 
            className="h-32 w-32 object-contain"
            priority
          />
        </div>
        
        <div className="relative z-10 space-y-1 text-center animate-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
          <h2 className="text-3xl font-headline font-black tracking-tighter uppercase">
            <span className="text-primary">AATMA</span> HUB
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">
            Premium Digital Solutions
          </p>
        </div>
      </div>
    </div>
  );
}
