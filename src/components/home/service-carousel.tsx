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
    <section className="py-4 overflow-hidden">
      <h2 className="text-sm font-headline font-black uppercase tracking-tighter mb-3 px-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-accent rounded-full shadow-[0_0_8px_#EC4899]" />
        {title}
      </h2>
      <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar">
        {items.map((item) => {
          const img = PlaceHolderImages.find(i => i.id === item.imgId);
          return (
            <Link 
              key={item.id} 
              href={`/product/${item.id}`} 
              className="flex-shrink-0 w-[calc((100%-24px)/3)] group active:scale-95 transition-transform"
            >
              <div className="relative h-20 w-full rounded-xl overflow-hidden mb-1.5 border border-border shadow-lg bg-card group-hover:border-primary/50 transition-colors">
                <Image
                  src={img?.imageUrl || "https://picsum.photos/seed/service/300/180"}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-1.5 left-2 right-2">
                  <span className="text-[8px] font-black text-white uppercase tracking-tight leading-none line-clamp-1">{item.name}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
