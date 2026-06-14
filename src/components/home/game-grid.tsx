
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
      <h2 className="text-lg font-headline font-bold mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-primary rounded-full" />
        Mobile Games
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {GAMES.map((game) => {
          const img = PlaceHolderImages.find(i => i.id === game.imgId);
          return (
            <Link key={game.id} href={`/product/${game.id}`} className="flex flex-col items-center group">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-1 border border-white/10 group-active:scale-95 transition-transform shadow-lg">
                <Image
                  src={img?.imageUrl || "https://picsum.photos/seed/game/400/400"}
                  alt={game.name}
                  fill
                  className="object-cover"
                  data-ai-hint="mobile legends game"
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground text-center line-clamp-1">
                {game.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
