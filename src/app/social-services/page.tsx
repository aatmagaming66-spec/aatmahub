
"use client"

import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const SOCIAL_SERVICES = [
  { id: "ig-serv", name: "Instagram Services", imgId: "social-ig" },
  { id: "fb-serv", name: "Facebook Services", imgId: "social-fb" },
  { id: "tg-serv", name: "Telegram Services", imgId: "social-fb" },
  { id: "yt-serv", name: "YouTube Growth", imgId: "ott-yt" },
];

export default function SocialServicesPage() {
  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none">Social Hub</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Digital Growth Solutions</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {SOCIAL_SERVICES.map((item) => {
          const img = PlaceHolderImages.find(i => i.id === item.imgId);
          return (
            <Link 
              key={item.id} 
              href={`/product/${item.id}`} 
              className="group transition-all duration-300 active:scale-95"
            >
              <div className="relative aspect-video w-full rounded-[24px] overflow-hidden mb-3 border border-border shadow-2xl bg-card group-hover:border-accent/50 transition-all duration-500">
                <Image
                  src={img?.imageUrl || "https://picsum.photos/seed/social/600/400"}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  <div className="bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tighter shadow-lg">
                    Active
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-40" />
              </div>
              <div className="text-center px-1">
                <h3 className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-accent transition-colors">
                  {item.name}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
