'use client';

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { Skeleton } from "@/components/ui/skeleton";
import { Share2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCarouselProps {
  title: string;
  category: "Social Services";
}

export function ServiceCarousel({ title, category }: ServiceCarouselProps) {
  const db = useFirestore();
  const Icon = Share2;

  const servicesQuery = useMemo(() => 
    query(
      collection(db, 'games'), 
      where('category', '==', category)
    ), 
  [db, category]);

  const { data: rawItems, loading } = useCollection(servicesQuery);

  const items = useMemo(() => {
    if (!rawItems) return [];
    return [...rawItems].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [rawItems]);

  if (loading) {
    return (
      <section className="py-6 px-2">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="w-1.5 h-5 bg-primary rounded-full shadow-[0_0_12px_#DC2626]" />
          <h2 className="text-base font-headline font-black uppercase tracking-tighter text-white">{title}</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 px-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-square bg-white/5 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-6 px-2">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 bg-primary rounded-full shadow-[0_0_12px_rgba(220,38,38,0.5)]" />
          <h2 className="text-base font-headline font-black uppercase tracking-tighter text-white">
            {title}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-2">
        {items.map((item) => {
          const isActive = item.status === 'active';
          return (
            <Link 
              key={item.id} 
              href={isActive ? `/product/${item.id}` : "#"}
              prefetch={false}
              className={cn(
                "w-full group transition-all flex flex-col active-press duration-300",
                !isActive && "cursor-default"
              )}
            >
              <div className="relative aspect-square overflow-hidden mb-2 border border-white/10 bg-transparent shadow-2xl transition-all rounded-2xl">
                {item.logo ? (
                  <Image 
                    src={item.logo} 
                    alt={item.name} 
                    fill 
                    className={cn(
                      "object-contain transition-transform duration-700 z-10",
                      isActive ? "opacity-100 group-hover:scale-105" : "opacity-60 grayscale-[0.3]"
                    )}
                    sizes="(max-width: 768px) 33vw, 200px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Icon size={24} className="text-white" />
                  </div>
                )}

                {!isActive && (
                  <div className="absolute inset-0 z-20 bg-black/30 backdrop-blur-[0.5px] flex items-center justify-center p-1">
                    <div className="bg-primary/40 border border-primary px-1 py-0.5 rounded shadow-[0_0_15px_rgba(220,38,38,0.8)] transform -rotate-12 animate-pulse">
                      <span className="text-[7px] font-black text-white uppercase tracking-tighter flex items-center gap-0.5">
                        OUT OF STOCK <Zap size={6} className="fill-current" />
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center px-1">
                <h3 className={cn(
                  "text-[10px] font-black uppercase tracking-tight line-clamp-1 transition-colors",
                  isActive ? "text-muted-foreground group-hover:text-primary" : "text-white/40"
                )}>
                  {item.name}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
