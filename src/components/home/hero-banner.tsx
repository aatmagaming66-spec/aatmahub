
"use client"

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function HeroBanner() {
  const hero = PlaceHolderImages.find(img => img.id === "hero-banner");

  return (
    <section className="relative w-full h-56 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-6">
        <h1 className="text-4xl font-headline font-bold text-white mb-2 leading-none">
          AATMA <span className="text-primary">HUB</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-[200px] font-medium">
          Premium Digital Solutions for Gaming and Digital Services
        </p>
      </div>
      <Image
        src={hero?.imageUrl || "https://picsum.photos/seed/aatma-hero/1200/600"}
        alt="AATMA HUB Hero"
        fill
        className="object-cover opacity-60"
        priority
        data-ai-hint="gaming background purple"
      />
    </section>
  );
}
