'use client';

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { Skeleton } from "@/components/ui/skeleton";
import { Gamepad2 } from "lucide-react";

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
    return rawGames
      .filter(g => g.status === 'active')
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
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
            <Skeleton key={i} className="w-full aspect-square rounded-none bg-white/5" />
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
  const isMlbb = game.name?.toLowerCase().includes('mlbb');

  return (
    <Link 
      href={`/product/${game.id}`} 
      prefetch={false}
      className="w-full group flex flex-col active-press"
    >
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-transparent border border-white/10 shadow-2xl transition-all duration-300">
        {game.logo ? (
          <Image 
            src={game.logo} 
            alt={game.name} 
            fill 
            className="object-contain opacity-100 transition-transform duration-700 group-hover:scale-105 z-10"
            sizes="(max-width: 768px) 33vw, 120px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Gamepad2 size={32} className="text-white" />
          </div>
        )}

        {isMlbb && (
          <div className="absolute top-1 left-1 z-30 bg-primary px-2 py-0.5 rounded-none flex items-center justify-center shadow-md border border-white/10 scale-75 origin-top-left">
            <span className="text-[6px] font-black uppercase text-white tracking-tighter leading-none">Instant ⚡</span>
          </div>
        )}
      </div>
      
      <div className="text-center mt-2.5 px-1">
        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
          {game.name} {game.flag}
        </span>
      </div>
    </Link>
  );
}
