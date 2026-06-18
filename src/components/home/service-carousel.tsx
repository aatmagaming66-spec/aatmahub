'use client';

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { Skeleton } from "@/components/ui/skeleton";
import { Tv, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCarouselProps {
  title: string;
  category: "OTT Services" | "Social Services";
}

export function ServiceCarousel({ title, category }: ServiceCarouselProps) {
  const db = useFirestore();
  const isOtt = category === 'OTT Services';
  const Icon = isOtt ? Tv : Share2;

  const servicesQuery = useMemo(() => 
    query(
      collection(db, 'games'), 
      where('category', '==', category)
    ), 
  [db, category]);

  const { data: rawItems, loading } = useCollection(servicesQuery);

  const items = useMemo(() => {
    if (!rawItems) return [];
    return rawItems
      .filter(i => i.status === 'active')
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [rawItems]);

  if (loading) {
    return (
      <section className="py-6 px-4">
        <div className="flex items-center gap-2 mb-6">
          <div className={isOtt ? "w-1 h-5 bg-accent rounded-full shadow-[0_0_8px_#EC4899]" : "w-1 h-5 bg-primary rounded-full shadow-[0_0_8px_#DC2626]"} />
          <h2 className="text-base font-headline font-black uppercase tracking-tighter">{title}</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className={cn(
              "flex-shrink-0 w-[120px] bg-white/5",
              isOtt ? "aspect-[2/3] rounded-[20px]" : "aspect-square rounded-none"
            )} />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-2">
          <div className={isOtt ? "w-1.5 h-5 bg-accent rounded-full shadow-[0_0_12px_rgba(236,72,153,0.5)]" : "w-1.5 h-5 bg-primary rounded-full shadow-[0_0_12px_rgba(220,38,38,0.5)]"} />
          <h2 className="text-base font-headline font-black uppercase tracking-tighter text-white">
            {title}
          </h2>
        </div>
        <Link href={isOtt ? "/ott-services" : "/social-services"} prefetch={false} className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-white transition-colors">Explorer</Link>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar">
        {items.map((item) => (
          <Link 
            key={item.id} 
            href={`/product/${item.id}`} 
            prefetch={false}
            className="flex-shrink-0 w-[calc((100%-24px)/3)] group active:scale-95 transition-all flex flex-col"
          >
            <div className={cn(
              "relative overflow-hidden mb-2.5 border border-white/5 bg-transparent shadow-xl group-hover:border-white/20 transition-all",
              isOtt ? "aspect-[2/3] rounded-[20px]" : "aspect-square rounded-none"
            )}>
              {item.logo ? (
                <Image 
                  src={item.logo} 
                  alt={item.name} 
                  fill 
                  className="object-contain opacity-100 transition-transform duration-500 group-hover:scale-110 z-10"
                  sizes="(max-width: 768px) 33vw, 100px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Icon size={24} className="text-white" />
                </div>
              )}
            </div>
            <div className="text-center px-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tight group-hover:text-white transition-colors line-clamp-1">
                {item.name} {item.flag}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}