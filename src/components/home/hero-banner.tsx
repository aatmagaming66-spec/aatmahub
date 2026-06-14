"use client"

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function HeroBanner() {
  const hero = PlaceHolderImages.find(img => img.id === "hero-banner");

  return (
    <section className="relative w-full h-64 overflow-hidden px-4 mt-4">
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/20 to-accent/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8">
          <h1 className="text-5xl font-headline font-black text-white mb-2 leading-none tracking-tighter">
            AATMA <span className="text-accent">HUB</span>
          </h1>
          <p className="text-sm text-white/80 max-w-[240px] font-bold uppercase tracking-widest leading-tight">
            Premium Digital Solutions for Gaming Excellence
          </p>
          <div className="mt-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest">
              Limited Deals
            </div>
          </div>
        </div>
        <Image
          src={hero?.imageUrl || "https://picsum.photos/seed/aatma-hero/1200/600"}
          alt="AATMA HUB Hero"
          fill
          className="object-cover opacity-80"
          priority
          data-ai-hint="gaming background dark red"
        />
      </div>
    </section>
  );
}