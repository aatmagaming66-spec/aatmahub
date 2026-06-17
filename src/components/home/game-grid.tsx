
'use client';

import { useMemo } from "react";
import Link from "next/link";
import { useFirestore } from "@/firebase/provider";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useMarketplaceAssets } from "@/hooks/use-marketplace-assets";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function GameGrid() {
  const db = useFirestore();
  
  const gamesQuery = useMemo(() => 
    query(collection(db, 'games'), orderBy('sortOrder', 'asc')), 
  [db]);

  const { data: games, loading: gamesLoading } = useCollection(gamesQuery);
  const { assetsMap, loading: assetsLoading } = useMarketplaceAssets();

  if (gamesLoading || assetsLoading) {
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
    <section className="py-4">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-sm font-headline font-black uppercase tracking-tighter flex items-center gap-2">
          <span className="w-1 h-4 bg-primary rounded-full" />
          Mobile Games
        </h2>
        <Link href="/games" className="text-[9px] font-black text-primary uppercase tracking-widest">View All</Link>
      </div>
      
      <div className="grid grid-cols-3 gap-3 px-4">
        {games.map((game) => {
          const asset = assetsMap.get(game.id);
          // Redundancy: check imageUrl, then logoUrl
          const imageUrl = asset?.imageUrl || asset?.logoUrl;

          return (
            <Link 
              key={game.id} 
              href={`/product/${game.id}`} 
              className="group flex flex-col active:scale-95 transition-transform"
            >
              <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-neutral-900 border border-white/5 shadow-xl">
                {imageUrl && (
                  <img 
                    src={imageUrl} 
                    alt={game.name} 
                    className="block w-full h-full object-cover z-0" 
                  />
                )}
                
                <div className="absolute top-2 left-2 z-10">
                  {game.flag && (
                    <div className="bg-black/60 rounded-lg p-1 flex items-center justify-center border border-white/10 min-w-[22px] min-h-[22px]">
                      <span className="text-xs leading-none">{game.flag}</span>
                    </div>
                  )}
                </div>

                <div className="absolute top-2 right-2 z-10">
                  <div className={cn(
                    "text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-lg",
                    game.status === 'active' ? 'bg-green-500' : 'bg-primary'
                  )}>
                    {game.status || 'Active'}
                  </div>
                </div>
              </div>

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
