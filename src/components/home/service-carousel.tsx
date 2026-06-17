
"use client"

import { useMemo } from "react";
import Link from "next/link";
import { useFirestore } from "@/firebase/provider";
import { collection } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { cn } from "@/lib/utils";

interface ServiceItem {
  id: string;
  firestoreId: string;
  entityId?: string;
  name: string;
  status?: string;
}

interface ServiceCarouselProps {
  title: string;
  items: ServiceItem[];
}

export function ServiceCarousel({ title, items }: ServiceCarouselProps) {
  const db = useFirestore();
  const isOtt = title.toLowerCase().includes('ott');
  
  const mediaQuery = useMemo(() => collection(db, 'media_assets'), [db]);
  const { data: mediaAssets } = useCollection(mediaQuery);

  return (
    <section className="py-4 overflow-hidden">
      <h2 className="text-sm font-headline font-black uppercase tracking-tighter mb-4 px-4 flex items-center gap-2">
        <span className={isOtt ? "w-1 h-4 bg-accent rounded-full shadow-[0_0_8px_#EC4899]" : "w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_#DC2626]"} />
        {title}
      </h2>
      <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar">
        {items.map((item) => {
          const lookupId = item.entityId ?? item.firestoreId ?? item.id;
          const media = mediaAssets.find(m => m.entityId === lookupId);
          const logoUrl = media?.logoUrl || "";

          return (
            <Link 
              key={item.firestoreId}
              href={`/product/${item.firestoreId}`} 
              className="flex-shrink-0 w-[calc((100%-24px)/3)] group transition-all duration-300 active:scale-95 flex flex-col"
            >
              <div className={cn(
                "relative aspect-[2/3] overflow-hidden rounded-xl mb-2.5 border border-border shadow-2xl bg-card transition-all duration-500",
                isOtt ? 'group-hover:border-accent/50' : 'group-hover:border-primary/50'
              )}>
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={item.name} 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <span className="text-[10px] font-black uppercase">{item.name.substring(0, 2)}</span>
                  </div>
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
