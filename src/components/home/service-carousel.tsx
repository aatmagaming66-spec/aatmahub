
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
      <h2 className="text-lg font-headline font-bold mb-4 px-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-accent rounded-full" />
        {title}
      </h2>
      <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar">
        {items.map((item) => {
          const img = PlaceHolderImages.find(i => i.id === item.imgId);
          return (
            <Link 
              key={item.id} 
              href={`/product/${item.id}`} 
              className="flex-shrink-0 w-36 group active:scale-95 transition-transform"
            >
              <div className="relative h-24 w-full rounded-xl overflow-hidden mb-2 border border-white/10 shadow-lg bg-card">
                <Image
                  src={img?.imageUrl || "https://picsum.photos/seed/service/300/180"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2">
                  <span className="text-xs font-bold text-white tracking-tight">{item.name}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
