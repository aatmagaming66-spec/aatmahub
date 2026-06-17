"use client"

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { useFirestore } from "@/firebase/provider";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { Skeleton } from "@/components/ui/skeleton";
import { Gamepad2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function GameGrid() {
  const db = useFirestore();
  
  const gamesQuery = useMemo(() => query(
    collection(db, 'games'),
    orderBy('sortOrder', 'asc')
  ), [db]);

  const { data: games, loading: gamesLoading } = useCollection(gamesQuery);
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

  if (gamesLoading) {
    return (
      <section className="py-4 px-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-[20px] bg-white/5" />
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
          const gameMedia = media[game.firestoreId];
          
          // Image Resolution Chain: Registry -> Legacy Field Fallbacks
          const url = gameMedia?.logoUrl || 
                      gameMedia?.thumbnailUrl || 
                      gameMedia?.icon || 
                      gameMedia?.imageUrl || 
                      game.cardImage || 
                      game.icon || 
                      game.thumbnail || 
                      null;

          return (
            <Link 
              key={game.firestoreId}
              href={`/product/${game.firestoreId}`} 
              className="group transition-all duration-300 active:scale-95 flex flex-col"
            >
              <div className="relative aspect-[2/3] w-full rounded-[20px] overflow-hidden mb-2.5 border border-border shadow-2xl bg-card group-hover:border-primary/50 transition-all duration-500">
                <div className="absolute inset-0 w-full h-full">
                  {url ? (
                    <Image 
                      src={url} 
                      alt={game.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-black to-card flex items-center justify-center opacity-20">
                       <Gamepad2 size={24} className="text-white" />
                    </div>
                  )}
                </div>
                
                <div className="absolute inset-0 z-10 p-2 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-start">
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
