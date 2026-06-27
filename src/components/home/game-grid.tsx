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
      where('category', '==', 'Direct Topup')
    ), 
  [db]);

  const { data: rawGames, loading } = useCollection(gamesQuery);

  const mobileGames = useMemo(() => {
    if (!rawGames) return [];
    return [...rawGames]
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [rawGames]);

  if (loading) {
    return (
      <section className="py-6 px-2">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="w-1 h-5 bg-primary rounded-full shadow-[0_0_8px_#DC2626]" />
          <h2 className="text-base font-headline font-black uppercase tracking-tighter text-white">Direct Topup</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-square rounded-2xl bg-white/5" />
          ))}
        </div>
      </section>
    );
  }

  if (mobileGames.length === 0) return null;

  return (
    <section className="py-6 px-2">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 bg-primary rounded-full shadow-[0_0_12px_rgba(220,38,38,0.5)]" />
          <h2 className="text-base font-headline font-black uppercase tracking-tighter text-white">
            Direct Topup
          </h2>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {mobileGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}

function GameCard({ game }: { game: any }) {
  const isActive = game.status === 'active';
  const isMLBB = game.name?.toLowerCase().includes('mlbb');

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
              "object-contain transition-transform duration-700 z-10",
              isActive ? "opacity-100 group-hover:scale-105" : "opacity-60 grayscale-[0.3]"
            )}
            sizes="(max-width: 768px) 33vw, 150px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Gamepad2 size={32} className="text-white" />
          </div>
        )}

        {!isActive && (
          <div className="absolute inset-0 z-20 bg-black/30 backdrop-blur-[0.5px] flex items-center justify-center p-1.5">
            <div className="bg-primary/40 border border-primary px-1.5 py-0.5 rounded shadow-[0_0_20px_rgba(220,38,38,0.8)] transform -rotate-12 animate-pulse">
              <span className="text-[8px] font-black text-white uppercase tracking-tighter flex items-center gap-0.5">
                OUT OF STOCK <Zap size={8} className="fill-current" />
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center mt-2 px-1">
        <span className={cn(
          "text-[10px] font-black uppercase tracking-tight transition-colors line-clamp-1",
          isActive ? "text-muted-foreground group-hover:text-primary" : "text-white/40"
        )}>
          {game.name} {game.flag}
        </span>
      </div>
    </Link>
  );
}
