"use client"

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFirestore } from "@/firebase/provider";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";

export function HeroBanner() {
  const db = useFirestore();
  
  // OPTIMIZATION: Simple query to avoid composite index requirements
  const bannersQuery = React.useMemo(() => query(
    collection(db, 'banners'),
    orderBy('sortOrder', 'asc')
  ), [db]);

  const { data: allBanners, loading } = useCollection(bannersQuery);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // CRITICAL FIX: Only include banners that are active AND have an image URL
  const activeBanners = React.useMemo(() => {
    return allBanners?.filter(b => b.status === 'active' && b.imageUrl) || [];
  }, [allBanners]);

  const displayBanners = React.useMemo(() => {
    // If we have no valid banners, show the professional fallback
    if (!loading && activeBanners.length === 0) {
      return [
        {
          id: "fallback",
          title: "Instant Game Top-Ups",
          subtitle: "Fast • Secure • Reliable",
          ctaText: "Shop Now",
          ctaLink: "/games",
          imageUrl: "https://picsum.photos/seed/aatma/1200/600"
        }
      ];
    }
    return activeBanners;
  }, [activeBanners, loading]);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  React.useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [emblaApi, displayBanners]);

  const scrollTo = React.useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  if (loading && activeBanners.length === 0) {
    return (
      <section className="relative w-full h-[220px] px-4 mt-4">
        <Skeleton className="w-full h-full bg-white/5 rounded-none" />
      </section>
    );
  }

  return (
    <section className="relative w-full h-[220px] overflow-hidden px-4 mt-4">
      <div 
        key={`carousel-${displayBanners.length}-${loading}`}
        className="relative w-full h-full rounded-none overflow-hidden shadow-2xl border border-white/5 bg-neutral-900" 
        ref={emblaRef}
      >
        <div className="flex h-full">
          {displayBanners.map((slide, index) => (
            <div key={slide.id || index} className="relative flex-[0_0_100%] min-w-0 h-full">
              {slide.imageUrl && (
                <Image
                  src={slide.imageUrl}
                  alt={slide.title || "Banner"}
                  fill
                  priority={index === 0}
                  className="object-cover z-0"
                  sizes="(max-width: 768px) 100vw, 1200px"
                  data-ai-hint="hero banner"
                />
              )}
              
              <div className="absolute inset-0 bg-black/40 z-10" />
              
              <div className="absolute inset-0 z-20 flex flex-col justify-center px-8">
                <h2 className="text-2xl font-headline font-black text-white mb-1.5 leading-tight tracking-tighter max-w-[200px] uppercase">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="text-[10px] text-white/70 max-w-[240px] font-black uppercase tracking-widest leading-none mb-5">
                    {slide.subtitle}
                  </p>
                )}
                <div>
                  <Link href={slide.ctaLink || '/'}>
                    <Button className="h-8 px-6 bg-primary hover:bg-secondary text-[10px] font-black uppercase tracking-widest rounded-none border-none active-press">
                      {slide.ctaText || 'Shop Now'}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {displayBanners.length > 1 && (
          <div className="absolute bottom-4 right-8 z-30 flex gap-1.5">
            {displayBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-1 transition-all rounded-none",
                  selectedIndex === index ? "w-4 bg-primary" : "w-1.5 bg-white/20"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
