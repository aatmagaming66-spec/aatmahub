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

  const { data: games, loading } = useCollection(gamesQuery);
  const [media, setMedia] = useState<Record<string, any>>({});
  const [imageDims, setImageDims] = useState<Record<string, { w: number, h: number }>>({});

  useEffect(() => {
    const q = collection(db, 'media_assets');
    const unsubscribe = onSnapshot(q, (snap) => {
      const mediaMap: Record<string, any> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        // DATA AUDIT: Map by Document ID (which is the Game ID)
        mediaMap[d.id] = data;
        console.log(`[DATA_AUDIT] Database URL for ${d.id}:`, data.logoUrl || 'NULL');
      });
      setMedia(mediaMap);
    });
    return () => unsubscribe();
  }, [db]);

  if (loading) {
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
          const gameMedia = media[game.id];
          const isEnabled = gameMedia ? gameMedia.isEnabled : true;
          
          // DIAGNOSTIC LOGS
          console.log(`[DATA_AUDIT] Mapping Game ${game.id} -> Mapped URL:`, gameMedia?.logoUrl || 'NULL');

          if (!isEnabled) return null;

          return (
            <div key={game.id} className="flex flex-col">
              <Link 
                href={`/product/${game.id}`} 
                className="group transition-all duration-300 active:scale-95"
              >
                <div className="relative aspect-[2/3] w-full rounded-[20px] overflow-hidden mb-2.5 border border-border shadow-2xl bg-card group-hover:border-primary/50 transition-all duration-500">
                  <div className="absolute inset-0 w-full h-full">
                    {gameMedia?.logoUrl ? (
                      <Image 
                        src={gameMedia.logoUrl} 
                        alt={game.name} 
                        fill 
                        style={{ objectFit: 'cover', objectPosition: 'center center' }}
                        className="transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 33vw, 20vw"
                        onLoadingComplete={(img) => {
                          setImageDims(prev => ({ ...prev, [game.id]: { w: img.naturalWidth, h: img.naturalHeight } }));
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-card group-hover:from-primary/30 transition-all duration-500 flex items-center justify-center opacity-20">
                         <Gamepad2 size={24} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 z-10 p-2 flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-start">
                      {game.flag ? (
                        <div className="bg-black/60 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-center border border-white/10">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                </div>
                <div className="text-center px-1">
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                    {game.name}
                  </span>
                </div>
              </Link>
              
              {/* DEBUG PANEL - URL & DIMENSIONS */}
              <div className="mt-1.5 px-2 py-1.5 bg-black/60 rounded-lg border border-white/10 space-y-1">
                <p className="text-[5px] text-primary font-black uppercase truncate tracking-tighter leading-tight">
                  URL: {gameMedia?.logoUrl ? 'VALID' : 'NULL'}
                </p>
                <p className="text-[5px] text-white/40 font-black uppercase tracking-tighter leading-tight">
                  DIM: {imageDims[game.id] ? `${imageDims[game.id].w}x${imageDims[game.id].h}` : 'LOADING...'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
