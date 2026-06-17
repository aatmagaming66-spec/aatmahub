
"use client"

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { useFirestore } from "@/firebase/provider";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { Skeleton } from "@/components/ui/skeleton";
import { Gamepad2, Database, Link as LinkIcon, AlertCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function GameGrid() {
  const db = useFirestore();
  
  const gamesQuery = useMemo(() => query(
    collection(db, 'games'),
    orderBy('sortOrder', 'asc')
  ), [db]);

  const { data: games, loading: gamesLoading } = useCollection(gamesQuery);
  const [media, setMedia] = useState<Record<string, any>>({});
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[AUDIT] Initializing media_assets handshake...");
    const q = collection(db, 'media_assets');
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const mediaMap: Record<string, any> = {};
      console.log(`[AUDIT] media_assets query returned ${snap.docs.length} documents.`);
      
      snap.docs.forEach(d => {
        const data = d.data();
        mediaMap[d.id] = data;
        // Detailed log of every document in registry
        console.log(`[AUDIT] Registry Entry: DocID=${d.id} | EntityID=${data.entityId} | Logo=${data.logoUrl ? 'PRESENT' : 'NULL'}`);
      });
      
      setMedia(mediaMap);
      setMediaLoading(false);
    }, (error) => {
      console.error("[AUDIT] Firestore Subscription Error:", error);
      setMediaError(error.message);
      setMediaLoading(false);
    });
    
    return () => unsubscribe();
  }, [db]);

  if (gamesLoading) {
    return (
      <section className="py-4 px-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-[20px] bg-white/5" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-sm font-headline font-black uppercase tracking-tighter flex items-center gap-2">
          <span className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_#DC2626]" />
          Mobile Games
        </h2>
        <Link href="/games" className="text-[9px] font-black text-primary uppercase tracking-widest">View All</Link>
      </div>
      
      <div className="grid grid-cols-3 gap-3 px-4">
        {games.map((game) => {
          const gameMedia = media[game.id];
          const hasMedia = !!gameMedia;
          const url = gameMedia?.logoUrl || null;
          
          // CRITICAL TRACE: Identity Matching
          console.log(`[TRACE] Mapping Game: ${game.name} | ID: ${game.id} | Match: ${hasMedia ? 'YES' : 'FAILED'} | URL: ${url ? 'FOUND' : 'NULL'}`);

          return (
            <div key={game.id} className="flex flex-col">
              <Link 
                href={`/product/${game.id}`} 
                className="group transition-all duration-300 active:scale-95"
              >
                <div className="relative aspect-[2/3] w-full rounded-[20px] overflow-hidden mb-2.5 border border-border shadow-2xl bg-card group-hover:border-primary/50 transition-all duration-500">
                  <div className="absolute inset-0 w-full h-full">
                    {url ? (
                      <Image 
                        src={url} 
                        alt={game.name} 
                        fill 
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-black to-card flex items-center justify-center opacity-20">
                         <Gamepad2 size={24} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 z-10 p-2 flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-start">
                      {game.flag ? (
                        <div className="bg-black/60 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-center border border-white/10">
                          <span className="text-xs leading-none">{game.flag}</span>
                        </div>
                      ) : <div />}
                      
                      <div className={cn(
                        "text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-lg",
                        game.status === 'active' ? 'bg-green-500' : 'bg-primary'
                      )}>
                        {game.status || 'Active'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center px-1">
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                    {game.name}
                  </span>
                </div>
              </Link>
              
              {/* TRACE PANEL: LIVE STATUS */}
              <div className="mt-1.5 p-2 bg-black/60 rounded-xl border border-white/5 space-y-1">
                 <div className="flex items-center justify-between">
                    <span className="text-[6px] font-black text-white/30 uppercase flex items-center gap-1"><Database size={6} /> Registry</span>
                    <div className={cn("h-1 w-1 rounded-full", hasMedia ? "bg-green-500" : "bg-primary")} />
                 </div>
                 <p className="text-[5px] text-white/50 font-mono uppercase truncate">ID: {game.id}</p>
                 <div className="flex items-center gap-1">
                    <LinkIcon size={6} className="text-primary" />
                    <p className={cn("text-[5px] font-black uppercase truncate", url ? "text-primary" : "text-white/20")}>
                      {url ? "URL: VALID" : "URL: NULL"}
                    </p>
                 </div>
                 {mediaError && (
                   <div className="flex items-center gap-1 text-[5px] text-primary font-black uppercase">
                     <AlertCircle size={6} /> ERR: PERMISSION
                   </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
