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
    <section className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-headline font-black uppercase tracking-tighter flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_#DC2626]" />
          Mobile Games
        </h2>
        <Link href="#" className="text-[10px] font-black text-primary uppercase tracking-widest">View All</Link>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {GAMES.map((game) => {
          const img = PlaceHolderImages.find(i => i.id === game.imgId);
          return (
            <Link key={game.id} href={`/product/${game.id}`} className="flex flex-col items-center group">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-2 border border-border group-active:scale-95 transition-all shadow-lg group-hover:border-accent/50 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.15)] bg-card">
                <Image
                  src={img?.imageUrl || "https://picsum.photos/seed/game/400/400"}
                  alt={game.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  data-ai-hint="mobile game poster"
                />
              </div>
              <span className="text-[9px] font-bold text-muted-foreground text-center line-clamp-1 uppercase tracking-tighter group-hover:text-foreground transition-colors">
                {game.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}