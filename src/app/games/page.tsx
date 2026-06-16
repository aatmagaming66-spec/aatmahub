'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { Gamepad2 } from 'lucide-react';

/**
 * Games Hub Sector
 * Now synchronized with the global Firestore registry.
 */
export default function GamesPage() {
  const db = useFirestore();
  
  // Real-time listener for the registry
  const gamesQuery = useMemo(() => query(
    collection(db, 'games'),
    orderBy('sortOrder', 'asc')
  ), [db]);

  const { data: games, loading } = useCollection(gamesQuery);

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none">Games Hub</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Mobile Game Top-Ups</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-[24px] bg-white/5" />
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[2.5rem] p-20 text-center space-y-4">
           <Gamepad2 className="h-10 w-10 text-muted-foreground mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Global Registry Empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {games.map((game) => {
            // Priority: cardImage -> thumbnail -> imageUrl -> placeholder
            const displayImage = game.cardImage || game.thumbnail || game.imageUrl;
            const placeholder = PlaceHolderImages.find(i => i.id === game.imgId);
            const finalSrc = displayImage || placeholder?.imageUrl || "https://picsum.photos/seed/game/400/600";

            return (
              <Link 
                key={game.id} 
                href={`/product/${game.id}`} 
                className="group transition-all duration-300 active:scale-95"
              >
                <div className="relative aspect-[3/4] w-full rounded-[24px] overflow-hidden mb-3 border border-border shadow-2xl bg-card group-hover:border-primary/50 transition-all duration-500">
                  <Image
                    src={finalSrc}
                    alt={game.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    data-ai-hint={placeholder?.imageHint || "game poster"}
                  />
                  
                  <div className="absolute inset-0 z-10 p-3 flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-start">
                      {game.flag ? (
                        <div className="bg-black/60 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-center border border-white/10">
                          <span className="text-sm leading-none">{game.flag}</span>
                        </div>
                      ) : <div />}
                      
                      <div className={`text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tighter shadow-lg ${
                        game.status === 'active' ? 'bg-green-500' : 'bg-primary'
                      }`}>
                        {game.status || 'Active'}
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60" />
                </div>
                <div className="text-center px-1">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                    {game.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
