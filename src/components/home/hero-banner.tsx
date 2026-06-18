"use client"

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFirestore } from "@/firebase/provider";
import { collection, query, orderBy, where } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";

export function HeroBanner() {
  const db = useFirestore();
  
  const bannersQuery = React.useMemo(() => query(
    collection(db, 'banners'),
    where('status', '==', 'active'),
    orderBy('sortOrder', 'asc')
  ), [db]);

  const { data: banners, loading } = useCollection(bannersQuery);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  
  const [selectedIndex, setSelectedIndex] = React.useState(0);

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

  const scrollTo = React.useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  if (loading) {
    return (
      <section className="relative w-full h-[220px] px-4 mt-4">
        <Skeleton className="w-full h-full bg-white/5" />
      </section>
    );
  }

  // Fallback if no banners are configured
  const displayBanners = banners?.length > 0 ? banners : [
    {
      id: "fallback",
      title: "Instant Game Top-Ups",
      subtitle: "Fast • Secure • Reliable",
      ctaText: "Top Up Now",
      ctaLink: "/games",
      imageUrl: "https://picsum.photos/seed/aatma/1200/600"
    }
  ];

  return (
    <section className="relative w-full h-[220px] overflow-hidden px-4 mt-4">
      <div className="relative w-full h-full rounded-none overflow-hidden shadow-2xl border border-white/5" ref={emblaRef}>
        <div className="flex h-full">
          {displayBanners.map((slide, index) => (
            <div key={slide.id} className="relative flex-[0_0_100%] min-w-0 h-full">
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover z-0"
              />
              
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
                    <Button className="h-8 px-6 bg-primary hover:bg-secondary text-[10px] font-black uppercase tracking-widest rounded-none border-none">
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
