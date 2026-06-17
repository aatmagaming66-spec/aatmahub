"use client"

import { useMemo } from "react";
import Link from "next/link";
import { useFirestore } from "@/firebase/provider";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useMediaRegistry } from "@/hooks/use-media-registry";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function GameGrid() {
  const db = useFirestore();
  const { getMediaAsset, loading: mediaLoading } = useMediaRegistry();
  
  const gamesQuery = useMemo(() => query(
    collection(db, 'games'),
    orderBy('sortOrder', 'asc')
  ), [db]);

  const { data: games, loading: gamesLoading } = useCollection(gamesQuery);

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
          const media = getMediaAsset(game.firestoreId || game.id);
          const imageUrl = media?.logoUrl || media?.thumbnailUrl || null;

          return (
            <Link 
              key={game.firestoreId}
              href={`/product/${game.firestoreId}`} 
              className="group flex flex-col relative transition-transform active:scale-95"
            >
              {/* 1. Image Area (Base Layer) */}
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/5 bg-neutral-900 shadow-xl">
                <div className="relative w-full h-full overflow-hidden rounded-xl">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={game.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5 opacity-10">
                      <span className="text-[10px] font-black uppercase">{game.name.substring(0, 2)}</span>
                    </div>
                  )}
                </div>
                
                {/* 2. ACTIVE Badge & 3. Flag (Overlay Layer) */}
                <div className="absolute inset-0 z-10 p-2 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-start">
                    {game.flag ? (
                      <div className="bg-black/60 backdrop-blur-md rounded-lg p-1 flex items-center justify-center border border-white/10 min-w-[22px] min-h-[22px]">
                        <span className="text-xs leading-none">{game.flag}</span>
                      </div>
                    ) : <div />}
                    
                    <div className={cn(
                      "text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-lg",
                      game.status === 'active' ? 'bg-green-500' : 'bg-primary'
                    )}>
                      {game.status || 'Active'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Game Name (Footer) */}
              <div className="text-center mt-2.5 px-1">
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