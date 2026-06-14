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
      <div className="flex items-center justify-between mb-3 px-4">
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
              className="flex-shrink-0 w-[calc((100%-24px)/3)] group active:scale-95 transition-all"
            >
              <div className="relative h-20 w-full rounded-xl overflow-hidden mb-1.5 border border-border shadow-lg bg-card group-hover:border-accent/50 transition-colors">
                <Image
                  src={img?.imageUrl || "https://picsum.photos/seed/game/400/400"}
                  alt={game.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  data-ai-hint="mobile game poster"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              <span className="text-[8px] font-black text-muted-foreground text-center line-clamp-1 uppercase tracking-tight group-hover:text-foreground transition-colors">
                {game.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
