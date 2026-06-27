'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Gamepad2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GamesPage() {
  const db = useFirestore();
  
  const gamesQuery = useMemo(() => query(
    collection(db, 'games'),
    where('category', '==', 'Mobile Games')
  ), [db]);

  const { data: rawGames, loading } = useCollection(gamesQuery);

  const mobileGames = useMemo(() => {
    if (!rawGames) return [];
    return [...rawGames]
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [rawGames]);

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none">Gaming Hub</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Instant Digital Distribution Center</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : mobileGames.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-20 text-center space-y-4">
           <Gamepad2 className="h-10 w-10 text-muted-foreground mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Registry Empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {mobileGames.map((game) => {
            const isActive = game.status === 'active';
            const isMLBB = game.name?.toLowerCase().includes('mlbb');

            return (
              <Link 
                key={game.id} 
                href={isActive ? `/product/${game.id}` : "#"} 
                className={cn(
                  "group transition-all duration-300 active:scale-95",
                  !isActive && "cursor-default opacity-90"
                )}
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3 border border-border shadow-2xl bg-transparent group-hover:border-primary/50 transition-all duration-500">
                  {isMLBB && (
                    <div className="absolute top-2 left-2 z-30 bg-primary/90 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/20 shadow-[0_0_10px_rgba(220,38,38,0.4)]">
                      <span className="text-[7px] font-black text-white uppercase tracking-tighter flex items-center gap-0.5">
                        INSTANT <Zap size={6} className="fill-current" />
                      </span>
                    </div>
                  )}

                  {game.logo ? (
                    <Image 
                      src={game.logo} 
                      alt={game.name} 
                      fill 
                      className={cn(
                        "object-contain z-10 transition-all duration-700",
                        isActive ? "opacity-100 group-hover:scale-110" : "opacity-60 grayscale-[0.2]"
                      )} 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Gamepad2 size={40} className="text-white" />
                    </div>
                  )}

                  {!isActive && (
                    <div className="absolute inset-0 z-20 bg-black/30 backdrop-blur-[0.5px] flex items-center justify-center p-4">
                      <div className="bg-primary/40 border border-primary px-3 py-1.5 rounded-md shadow-[0_0_20px_rgba(220,38,38,0.8)] transform -rotate-12 animate-pulse">
                        <span className="text-[9px] font-black text-white uppercase tracking-tighter flex items-center gap-1">
                          OUT OF STOCK <Zap size={10} className="fill-current" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center px-1">
                  <h3 className={cn(
                    "text-[10px] font-black uppercase tracking-tight transition-colors",
                    isActive ? "text-white group-hover:text-primary" : "text-white/40"
                  )}>
                    {game.name} {game.flag}
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
