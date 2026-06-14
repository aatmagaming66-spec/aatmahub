"use client"

import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface ServiceItem {
  id: string;
  name: string;
  imgId: string;
}

interface ServiceCarouselProps {
  title: string;
  items: ServiceItem[];
}

export function ServiceCarousel({ title, items }: ServiceCarouselProps) {
  return (
    <section className="py-6 overflow-hidden">
      <h2 className="text-lg font-headline font-black uppercase tracking-tighter mb-4 px-4 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-accent rounded-full shadow-[0_0_10px_#EC4899]" />
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar">
        {items.map((item) => {
          const img = PlaceHolderImages.find(i => i.id === item.imgId);
          return (
            <Link 
              key={item.id} 
              href={`/product/${item.id}`} 
              className="flex-shrink-0 w-40 group active:scale-95 transition-transform"
            >
              <div className="relative h-24 w-full rounded-2xl overflow-hidden mb-2 border border-border shadow-xl bg-card group-hover:border-primary/50">
                <Image
                  src={img?.imageUrl || "https://picsum.photos/seed/service/300/180"}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.name}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}