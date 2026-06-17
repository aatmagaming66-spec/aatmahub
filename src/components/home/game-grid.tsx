"use client"

import { useMemo } from "react";
import Link from "next/link";
import { useFirestore } from "@/firebase/provider";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function GameGrid() {
  const db = useFirestore();
  
  // High-performance real-time sync with master registry
  const gamesQuery = useMemo(() => query(
    collection(db, 'games'),
    orderBy('sortOrder', 'asc')
  ), [db]);

  const mediaQuery = useMemo(() => collection(db, 'media_assets'), [db]);

  const { data: games, loading: gamesLoading } = useCollection(gamesQuery);
  const { data: mediaAssets, loading: mediaLoading } = useCollection(mediaQuery);

  if (gamesLoading || mediaLoading) {
    return (
      <section className="py-4 px-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl bg-white/5" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-sm font-headline font-black uppercase tracking-tighter flex items-center gap-2">
          <span className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_#DC2626]" />
          Mobile Games
        </h2>
        <Link href="/games" className="text-[9px] font-black text-primary uppercase tracking-widest">View All</Link>
      </div>
      
      <div className="grid grid-cols-3 gap-3 px-4">
        {games.map((game) => {
          // Robust identifier resolution: Priority for user-defined entityId
          const lookupId = game.entityId || game.firestoreId || game.id;
          
          // Direct matching with Media Hub registry
          const media = mediaAssets.find(item => item.entityId === lookupId);
          
          // Strict URL resolution: Logo -> Thumbnail -> Banner
          const imageUrl = media?.logoUrl || media?.thumbnailUrl || media?.bannerUrl || null;

          return (
            <Link 
              key={game.firestoreId}
              href={`/product/${game.firestoreId}`} 
              className="group transition-all duration-300 active:scale-95 flex flex-col"
            >
              {/* PRIMARY IMAGE CONTAINER */}
              <div className="relative aspect-[2/3] w-full mb-2.5">
                <div className="relative h-full w-full overflow-hidden rounded-xl border border-border shadow-2xl group-hover:border-primary/50 transition-all duration-500">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={game.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-900" />
                  )}
                </div>
                
                {/* OVERLAY LAYER: Badges and Flags (z-10 above image) */}
                <div className="absolute inset-x-2 top-2 z-10 flex justify-between items-start pointer-events-none">
                  {game.flag && (
                    <div className="bg-black/60 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-center border border-white/10">
                      <span className="text-xs leading-none">{game.flag}</span>
                    </div>
                  )}
                  <div className={cn(
                    "text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-lg",
                    game.status === 'active' ? 'bg-green-500' : 'bg-primary'
                  )}>
                    {game.status || 'Active'}
                  </div>
                </div>
              </div>

              {/* PRODUCT LABEL */}
              <div className="text-center px-1">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                  {game.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
