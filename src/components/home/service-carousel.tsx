'use client';

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMarketplaceAssets } from "@/hooks/use-marketplace-assets";
import { cn } from "@/lib/utils";

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
  const { assetsMap, loading } = useMarketplaceAssets();
  const isOtt = title.toLowerCase().includes('ott');

  if (loading) return null;

  return (
    <section className="py-4 overflow-hidden">
      <h2 className="text-sm font-headline font-black uppercase tracking-tighter mb-4 px-4 flex items-center gap-2">
        <span className={isOtt ? "w-1 h-4 bg-accent rounded-full shadow-[0_0_8px_#EC4899]" : "w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_#DC2626]"} />
        {title}
      </h2>
      <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar">
        {items.map((item) => {
          const asset = assetsMap.get(item.id);
          const rawUrl = asset?.imageUrl || asset?.logoUrl;
          const imageUrl = (rawUrl && !rawUrl.startsWith('blob:')) ? rawUrl : null;

          return (
            <Link 
              key={item.id} 
              href={`/product/${item.id}`} 
              className="flex-shrink-0 w-[calc((100%-24px)/3)] group active:scale-95 transition-all flex flex-col"
            >
              <div className={cn(
                "relative aspect-[2/3] rounded-xl overflow-hidden mb-2.5 border border-border shadow-2xl bg-neutral-900 transition-all",
                isOtt ? 'group-hover:border-accent/50' : 'group-hover:border-primary/50'
              )}>
                {imageUrl && (
                  <Image 
                    src={imageUrl} 
                    alt={item.name} 
                    fill
                    className="object-cover transition-opacity duration-300"
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                )}
                
                <div className="absolute top-2 right-2 z-10 pointer-events-none">
                  <div className={`text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-lg ${
                    item.status === 'inactive' ? 'bg-primary' : 'bg-green-500'
                  }`}>
                    {item.status || 'Active'}
                  </div>
                </div>
              </div>
              <div className="text-center px-1">
                <span className={`text-[8px] font-black text-muted-foreground uppercase tracking-tight transition-colors line-clamp-1 ${isOtt ? 'group-hover:text-accent' : 'group-hover:text-primary'}`}>
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