
"use client"

import * as React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SLIDES = [
  {
    id: "hero-main",
    title: "Instant Game Top-Ups",
    description: "Fast • Secure • Reliable",
    cta: "Top Up Now",
    imgId: "hero-main"
  },
  {
    id: "hero-mlbb",
    title: "Mobile Legends Diamonds",
    description: "Best Prices & Instant Delivery",
    cta: "Shop Now",
    imgId: "hero-mlbb"
  },
  {
    id: "hero-ott",
    title: "OTT Premium Access",
    description: "Netflix • Prime • Spotify",
    cta: "Explore Plans",
    imgId: "hero-ott"
  },
  {
    id: "hero-social",
    title: "Social Media Growth",
    description: "Instagram • Telegram • YouTube",
    cta: "View Services",
    imgId: "hero-social"
  },
  {
    id: "hero-trust",
    title: "Trusted Digital Hub",
    description: "India's Premier Digital Marketplace",
    cta: "Get Started",
    imgId: "hero-trust"
  }
];

export function HeroBanner() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
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

  return (
    <section className="relative w-full h-[220px] overflow-hidden px-4 mt-4">
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/5" ref={emblaRef}>
        <div className="flex h-full">
          {SLIDES.map((slide) => {
            const img = PlaceHolderImages.find(img => img.id === slide.imgId);
            return (
              <div key={slide.id} className="relative flex-[0_0_100%] min-w-0 h-full">
                {/* Image Background */}
                <Image
                  src={img?.imageUrl || "https://picsum.photos/seed/aatma/1200/600"}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={slide.id === "hero-main"}
                  data-ai-hint={img?.imageHint}
                />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                
                {/* Content */}
                <div className="absolute inset-0 z-20 flex flex-col justify-center px-8">
                  <h2 className="text-2xl font-headline font-black text-white mb-1.5 leading-tight tracking-tighter max-w-[200px] uppercase">
                    {slide.title.split(' ').map((word, i) => (
                      <span key={i} className={i % 2 !== 0 ? "text-accent" : ""}>{word} </span>
                    ))}
                  </h2>
                  <p className="text-[10px] text-white/70 max-w-[240px] font-black uppercase tracking-widest leading-none mb-5">
                    {slide.description}
                  </p>
                  <div>
                    <Button 
                      className="h-8 px-6 bg-primary hover:bg-secondary text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 border-none transition-all active:scale-95"
                    >
                      {slide.cta}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Pagination Dots */}
        <div className="absolute bottom-4 right-8 z-30 flex gap-1.5">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-1 transition-all rounded-full",
                selectedIndex === index 
                  ? "w-4 bg-primary shadow-[0_0_8px_#DC2626]" 
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
