
'use client';

import { useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { Skeleton } from "@/components/ui/skeleton";
import { Gamepad2 } from "lucide-react";

export function GameGrid() {
  const db = useFirestore();
  
  // Removed orderBy from query level to prevent documents with missing sortOrder from being excluded
  const gamesQuery = useMemo(() => 
    query(
      collection(db, 'games'), 
      where('category', '==', 'Mobile Games')
    ), 
  [db]);

  const { data: rawGames, loading } = useCollection(gamesQuery);

  const games = useMemo(() => {
    if (!rawGames) return [];
    
    // Client-side sorting and filtering
    return rawGames
      .filter(g => g.status === 'active')
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [rawGames]);

  if (loading) {
    return (
      <section className="py-6 px-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-5 bg-primary rounded-full shadow-[0_0_8px_#DC2626]" />
          <h2 className="text-base font-headline font-black uppercase tracking-tighter">Mobile Games</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-[24px] bg-white/5" />
          ))}
        </div>
      </section>
    );
  }

  if (games.length === 0) {
    return null;
  }

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 bg-primary rounded-full shadow-[0_0_12px_rgba(220,38,38,0.5)]" />
          <h2 className="text-base font-headline font-black uppercase tracking-tighter text-white">
            Mobile Games
          </h2>
        </div>
        <Link href="/games" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-white transition-colors">View All Hub</Link>
      </div>
      
      <div className="grid grid-cols-3 gap-4 px-4">
        {games.map((game) => (
          <Link 
            key={game.id} 
            href={`/product/${game.id}`} 
            className="group flex flex-col active:scale-95 transition-all duration-300"
          >
            <div className="relative aspect-[3/4] w-full rounded-[24px] overflow-hidden bg-card border border-white/5 shadow-2xl group-hover:border-primary/40 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-black to-card" />
              
              {game.logo ? (
                <Image 
                  src={game.logo} 
                  alt={game.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Gamepad2 size={32} className="text-white" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            </div>
            
            <div className="text-center mt-3 px-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                {game.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
