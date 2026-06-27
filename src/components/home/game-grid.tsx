'use client';

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { Skeleton } from "@/components/ui/skeleton";
import { Gamepad2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function GameGrid() {
  const db = useFirestore();
  
  const gamesQuery = useMemo(() => 
    query(
      collection(db, 'games'), 
      where('category', '==', 'Mobile Games')
    ), 
  [db]);

  const { data: rawGames, loading } = useCollection(gamesQuery);

  const games = useMemo(() => {
    if (!rawGames) return [];
    return [...rawGames].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [rawGames]);

  if (loading) {
    return (
      <section className="py-6 px-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-5 bg-primary rounded-full shadow-[0_0_8px_#DC2626]" />
          <h2 className="text-base font-headline font-black uppercase tracking-tighter text-white">Mobile Games</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-square rounded-2xl bg-white/5" />
          ))}
        </div>
      </section>
    );
  }

  if (games.length === 0) return null;

  return (
    <section className="py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 bg-primary rounded-full shadow-[0_0_12px_rgba(220,38,38,0.5)]" />
          <h2 className="text-base font-headline font-black uppercase tracking-tighter text-white">
            Mobile Games
          </h2>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}

function GameCard({ game }: { game: any }) {
  const isActive = game.status === 'active';

  return (
    <Link 
      href={isActive ? `/product/${game.id}` : "#"} 
      prefetch={false}
      className={cn(
        "w-full group flex flex-col active-press transition-opacity duration-300",
        !isActive && "cursor-default"
      )}
    >
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-transparent border border-white/10 shadow-2xl transition-all duration-300">
        {game.logo ? (
          <Image 
            src={game.logo} 
            alt={game.name} 
            fill 
            className={cn(
              "object-contain transition-transform duration-700 z-10",
              isActive ? "opacity-100 group-hover:scale-105" : "opacity-40 grayscale-[0.5]"
            )}
            sizes="(max-width: 768px) 33vw, 120px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Gamepad2 size={32} className="text-white" />
          </div>
        )}

        {!isActive && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-1.5">
            <div className="bg-primary/20 border border-primary/40 px-1.5 py-0.5 rounded shadow-[0_0_15px_rgba(220,38,38,0.6)] transform -rotate-12 animate-pulse">
              <span className="text-[8px] font-black text-white uppercase tracking-tighter flex items-center gap-0.5">
                OUT OF STOCK <Zap size={8} className="fill-current" />
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center mt-2.5 px-1">
        <span className={cn(
          "text-[9px] font-black uppercase tracking-tight transition-colors line-clamp-1",
          isActive ? "text-muted-foreground group-hover:text-primary" : "text-white/20"
        )}>
          {game.name} {game.flag}
        </span>
      </div>
    </Link>
  );
}
