'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { Share2 } from 'lucide-react';

/**
 * Social Hub Sector
 * Now synchronized with the global Firestore registry.
 */
export default function SocialServicesPage() {
  const db = useFirestore();
  
  // Real-time listener for social services
  const socialQuery = useMemo(() => query(
    collection(db, 'social_services'),
    orderBy('sortOrder', 'asc')
  ), [db]);

  const { data: items, loading } = useCollection(socialQuery);

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none">Social Hub</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Digital Growth Solutions</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-[24px] bg-white/5" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[2.5rem] p-20 text-center space-y-4">
           <Share2 className="h-10 w-10 text-muted-foreground mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Growth Registry Empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            // Priority: cardImage -> thumbnail -> imageUrl -> placeholder
            const displayImage = item.cardImage || item.thumbnail || item.imageUrl;
            const placeholder = PlaceHolderImages.find(i => i.id === item.imgId);
            const finalSrc = displayImage || placeholder?.imageUrl || "https://picsum.photos/seed/social/600/400";

            return (
              <Link 
                key={item.id} 
                href={`/product/${item.id}`} 
                className="group transition-all duration-300 active:scale-95"
              >
                <div className="relative aspect-video w-full rounded-[24px] overflow-hidden mb-3 border border-border shadow-2xl bg-card group-hover:border-accent/50 transition-all duration-500">
                  <Image
                    src={finalSrc}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  <div className="absolute top-3 right-3 z-10 pointer-events-none">
                    <div className={`text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tighter shadow-lg ${
                      item.status === 'active' ? 'bg-green-500' : 'bg-primary'
                    }`}>
                      {item.status || 'Active'}
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
      )}
    </div>
  );
}
