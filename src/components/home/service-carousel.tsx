
"use client"

import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface ServiceItem {
  id: string;
  name: string;
  imgId?: string;
  cardImage?: string;
  thumbnail?: string;
  imageUrl?: string;
  status?: string;
}

interface ServiceCarouselProps {
  title: string;
  items: ServiceItem[];
}

export function ServiceCarousel({ title, items }: ServiceCarouselProps) {
  return (
    <section className="py-4 overflow-hidden">
      <h2 className="text-sm font-headline font-black uppercase tracking-tighter mb-4 px-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-accent rounded-full shadow-[0_0_8px_#EC4899]" />
        {title}
      </h2>
      <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar">
        {items.map((item) => {
          // IMAGE PRIORITY PROTOCOL: cardImage -> thumbnail -> imageUrl -> placeholder
          const displayImage = item.cardImage || item.thumbnail || item.imageUrl;
          
          // Fallback to placeholder lookup
          const placeholder = PlaceHolderImages.find(i => i.id === item.imgId);
          const finalSrc = displayImage || placeholder?.imageUrl || "https://picsum.photos/seed/service/400/600";

          return (
            <Link 
              key={item.id} 
              href={`/product/${item.id}`} 
              className="flex-shrink-0 w-[calc((100%-24px)/3)] group transition-all duration-300 active:scale-95"
            >
              <div className="relative h-[145px] w-full rounded-[20px] overflow-hidden mb-2.5 border border-border shadow-2xl shadow-accent/5 bg-card group-hover:border-accent/50 transition-all duration-500">
                <Image
                  src={finalSrc}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                <div className="absolute top-2 right-2 z-10 pointer-events-none">
                  <div className={`text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-lg ${
                    item.status === 'inactive' ? 'bg-primary' : 'bg-green-500'
                  }`}>
                    {item.status || 'Active'}
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-40" />
              </div>
              <div className="text-center px-1">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tight group-hover:text-accent transition-colors line-clamp-1">
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
