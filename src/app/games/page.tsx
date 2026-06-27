'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Gamepad2 } from 'lucide-react';

export default function GamesPage() {
  const db = useFirestore();
  
  const gamesQuery = useMemo(() => query(
    collection(db, 'games'),
    where('category', '==', 'Mobile Games'),
    where('status', '==', 'active')
  ), [db]);

  const { data: rawGames, loading } = useCollection(gamesQuery);

  const games = useMemo(() => {
    if (!rawGames) return [];
    return [...rawGames].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [rawGames]);

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none">Games Hub</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Mobile Game Top-Ups</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-20 text-center space-y-4">
           <Gamepad2 className="h-10 w-10 text-muted-foreground mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Global Registry Empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {games.map((game) => {
            const isMlbb = game.name?.toLowerCase().includes('mlbb');

            return (
              <Link 
                key={game.id} 
                href={`/product/${game.id}`} 
                className="group transition-all duration-300 active:scale-95"
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3 border border-border shadow-2xl bg-transparent group-hover:border-primary/50 transition-all duration-500">
                  {game.logo ? (
                    <Image 
                      src={game.logo} 
                      alt={game.name} 
                      fill 
                      className="object-contain opacity-100 transition-transform duration-700 group-hover:scale-110 z-10" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Gamepad2 size={40} className="text-white" />
                    </div>
                  )}

                  {isMlbb && (
                    <div className="absolute top-1.5 left-1.5 z-30 bg-red-600/90 px-1.5 py-0.5 rounded-lg flex items-center justify-center shadow-md border border-white/10">
                      <span className="text-[8px] font-black uppercase text-white tracking-tighter leading-none">Instant ⚡</span>
                    </div>
                  )}
                </div>
                <div className="text-center px-1">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">
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
