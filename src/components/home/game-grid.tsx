
'use client';

import { useMemo } from "react";
import Link from "next/link";
import { useFirestore } from "@/firebase/provider";
import { collection, query, orderBy, where } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { Skeleton } from "@/components/ui/skeleton";
import { Gamepad2 } from "lucide-react";

export function GameGrid() {
  const db = useFirestore();
  
  const gamesQuery = useMemo(() => 
    query(
      collection(db, 'games'), 
      where('status', '==', 'active'),
      orderBy('sortOrder', 'asc')
    ), 
  [db]);

  const { data: games, loading } = useCollection(gamesQuery);

  if (loading) {
    return (
      <section className="py-4 px-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl bg-white/5" />
          ))}
        </div>
      </section>
    );
  }

  if (!games || games.length === 0) {
    return null;
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
        {games.map((game) => (
          <Link 
            key={game.id} 
            href={`/product/${game.id}`} 
            className="group flex flex-col active:scale-95 transition-transform"
          >
            <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-neutral-900 border border-white/5 shadow-xl flex items-center justify-center">
              <Gamepad2 size={24} className="text-white opacity-10" />
            </div>
            <div className="text-center mt-2.5 px-1">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                {game.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
