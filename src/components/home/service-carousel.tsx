
'use client';

import Link from "next/link";
import { Tv, Share2 } from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
  status?: string;
}

interface ServiceCarouselProps {
  title: string;
  items: ServiceItem[];
}

export function ServiceCarousel({ title, items }: ServiceCarouselProps) {
  const isOtt = title.toLowerCase().includes('ott');
  const Icon = isOtt ? Tv : Share2;

  // No hardcoded data here. If items is empty, render nothing.
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="py-4 overflow-hidden">
      <h2 className="text-sm font-headline font-black uppercase tracking-tighter mb-4 px-4 flex items-center gap-2">
        <span className={isOtt ? "w-1 h-4 bg-accent rounded-full" : "w-1 h-4 bg-primary rounded-full"} />
        {title}
      </h2>
      <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar">
        {items.map((item) => (
          <Link 
            key={item.id} 
            href={`/product/${item.id}`} 
            className="flex-shrink-0 w-[calc((100%-24px)/3)] group active:scale-95 transition-all flex flex-col"
          >
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2.5 border border-border bg-neutral-900 flex items-center justify-center">
              <Icon size={20} className="text-white opacity-10" />
            </div>
            <div className="text-center px-1">
              <span className={`text-[8px] font-black text-muted-foreground uppercase tracking-tight transition-colors line-clamp-1`}>
                {item.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
