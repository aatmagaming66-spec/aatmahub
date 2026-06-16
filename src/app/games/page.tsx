
"use client"

import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const GAMES = [
  { id: "mlbb-in", name: "MLBB India", imgId: "game-mlbb-india", flag: "🇮🇳" },
  { id: "mlbb-id", name: "MLBB Indonesia", imgId: "game-mlbb", flag: "🇮🇩" },
  { id: "mlbb-ph", name: "MLBB Philippines", imgId: "game-mlbb", flag: "🇵🇭" },
  { id: "mlbb-my", name: "MLBB Malaysia", imgId: "game-mlbb", flag: "🇲🇾" },
  { id: "mlbb-sg", name: "MLBB Singapore", imgId: "game-mlbb", flag: "🇸🇬" },
  { id: "mlbb-ru", name: "MLBB Russia", imgId: "game-mlbb", flag: "🇷🇺" },
  { id: "mlbb-br", name: "MLBB Brazil", imgId: "game-mlbb", flag: "🇧🇷" },
  { id: "hok", name: "Honor of Kings", imgId: "game-hok" },
  { id: "genshin", name: "Genshin Impact", imgId: "game-genshin" },
  { id: "bgmi", name: "BGMI", imgId: "game-bgmi" },
  { id: "mcgg", name: "Magic Chess Go Go", imgId: "game-mlbb" },
];

export default function GamesPage() {
  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none">Games Hub</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Mobile Game Top-Ups</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {GAMES.map((game) => {
          const img = PlaceHolderImages.find(i => i.id === game.imgId);
          return (
            <Link 
              key={game.id} 
              href={`/product/${game.id}`} 
              className="group transition-all duration-300 active:scale-95"
            >
              <div className="relative aspect-[3/4] w-full rounded-[24px] overflow-hidden mb-3 border border-border shadow-2xl bg-card group-hover:border-primary/50 transition-all duration-500">
                <Image
                  src={img?.imageUrl || "https://picsum.photos/seed/game/400/600"}
                  alt={game.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  data-ai-hint={img?.imageHint || "game poster"}
                />
                
                <div className="absolute inset-0 z-10 p-3 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-start">
                    {game.flag ? (
                      <div className="bg-black/60 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-center border border-white/10">
                        <span className="text-sm leading-none">{game.flag}</span>
                      </div>
                    ) : <div />}
                    
                    <div className="bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tighter shadow-lg">
                      Active
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60" />
              </div>
              <div className="text-center px-1">
                <h3 className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                  {game.name}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
