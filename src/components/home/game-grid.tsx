
"use client"

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFirestore } from "@/firebase/provider";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Skeleton } from "@/components/ui/skeleton";

export function GameGrid() {
  const db = useFirestore();
  
  // Fetch live games from registry
  const gamesQuery = useMemo(() => query(
    collection(db, 'games'),
    orderBy('sortOrder', 'asc')
  ), [db]);

  const { data: games, loading } = useCollection(gamesQuery);

  if (loading) {
    return (
      <section className="py-4 px-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[145px] w-full rounded-[20px] bg-white/5" />
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
          // IMAGE PRIORITY PROTOCOL: cardImage -> thumbnail -> imageUrl -> placeholder
          const displayImage = game.cardImage || game.thumbnail || game.imageUrl;
          
          // Fallback to placeholder lookup if no admin image exists
          const placeholder = PlaceHolderImages.find(i => i.id === game.imgId);
          const finalSrc = displayImage || placeholder?.imageUrl || "https://picsum.photos/seed/game/400/600";

          return (
            <Link 
              key={game.id} 
              href={`/product/${game.id}`} 
              className="group transition-all duration-300 active:scale-95"
            >
              <div className="relative h-[145px] w-full rounded-[20px] overflow-hidden mb-2.5 border border-border shadow-2xl shadow-primary/5 bg-card group-hover:border-primary/50 transition-all duration-500">
                <Image
                  src={finalSrc}
                  alt={game.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  data-ai-hint={placeholder?.imageHint || "mobile game poster"}
                />
                
                <div className="absolute inset-0 z-10 p-2 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-start">
                    {game.flag ? (
                      <div className="bg-black/60 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-center border border-white/10">
                        <span className="text-xs leading-none">{game.flag}</span>
                      </div>
                    ) : <div />}
                    
                    <div className={`text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-lg ${
                      game.status === 'active' ? 'bg-green-500' : 'bg-primary'
                    }`}>
                      {game.status || 'Active'}
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              </div>
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
