"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFirestore } from "@/firebase/provider";
import { collection, onSnapshot } from "firebase/firestore";
import { cn } from "@/lib/utils";

interface ServiceItem {
  id: string;
  firestoreId: string;
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
  
  const [media, setMedia] = useState<Record<string, any>>({});

  useEffect(() => {
    const q = collection(db, 'media_assets');
    const unsubscribe = onSnapshot(q, (snap) => {
      const mediaMap: Record<string, any> = {};
      snap.docs.forEach(d => {
        mediaMap[d.id] = d.data();
      });
      setMedia(mediaMap);
    });
    return () => unsubscribe();
  }, [db]);

  return (
    <section className="py-4 overflow-hidden">
      <h2 className="text-sm font-headline font-black uppercase tracking-tighter mb-4 px-4 flex items-center gap-2">
        <span className={isOtt ? "w-1 h-4 bg-accent rounded-full shadow-[0_0_8px_#EC4899]" : "w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_#DC2626]"} />
        {title}
      </h2>
      <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar">
        {items.map((item) => {
          const itemMedia = media[item.firestoreId];
          
          const imageUrl = 
            itemMedia?.logoUrl || 
            itemMedia?.imageUrl || 
            itemMedia?.thumbnailUrl || 
            null;

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
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={item.name} 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                  ) : null}
                </div>
                
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