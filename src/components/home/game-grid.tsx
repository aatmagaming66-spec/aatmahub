"use client"

import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const GAMES = [
  { id: "mlbb-in", name: "MLBB India", imgId: "game-mlbb" },
  { id: "mlbb-id", name: "MLBB Indonesia", imgId: "game-mlbb" },
  { id: "mlbb-ph", name: "MLBB Philippines", imgId: "game-mlbb" },
  { id: "mlbb-my", name: "MLBB Malaysia", imgId: "game-mlbb" },
  { id: "hok", name: "Honor of Kings", imgId: "game-hok" },
  { id: "genshin", name: "Genshin Impact", imgId: "game-genshin" },
  { id: "bgmi", name: "BGMI", imgId: "game-bgmi" },
  { id: "mcgg", name: "Magic Chess", imgId: "game-mlbb" },
];

export function GameGrid() {
  return (
    <section className="py-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-sm font-headline font-black uppercase tracking-tighter flex items-center gap-2">
          <span className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_#DC2626]" />
          Mobile Games
        </h2>
        <Link href="#" className="text-[9px] font-black text-primary uppercase tracking-widest">View All</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar">
        {GAMES.map((game) => {
          const img = PlaceHolderImages.find(i => i.id === game.imgId);
          return (
            <Link 
              key={game.id} 
              href={`/product/${game.id}`} 
              className="flex-shrink-0 w-[calc((100%-24px)/3)] group transition-all duration-300 active:scale-95"
            >
              <div className="relative h-[155px] w-full rounded-[20px] overflow-hidden mb-2.5 border border-border shadow-2xl shadow-primary/5 bg-card group-hover:border-primary/50 transition-all duration-500">
                <Image
                  src={img?.imageUrl || "https://picsum.photos/seed/game/400/600"}
                  alt={game.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  data-ai-hint="mobile game poster"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
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
