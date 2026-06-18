'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Share2 } from 'lucide-react';

export default function SocialServicesPage() {
  const db = useFirestore();
  
  const socialQuery = useMemo(() => query(
    collection(db, 'games'),
    where('category', '==', 'Social Services'),
    where('status', '==', 'active')
  ), [db]);

  const { data: rawItems, loading } = useCollection(socialQuery);

  const items = useMemo(() => {
    if (!rawItems) return [];
    return [...rawItems].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [rawItems]);

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none">Social Hub</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Digital Growth Solutions</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-none bg-white/5" />
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
            return (
              <Link 
                key={item.id} 
                href={`/product/${item.id}`} 
                className="group transition-all duration-300 active:scale-95"
              >
                <div className="relative aspect-square w-full rounded-none overflow-hidden mb-3 border border-border shadow-2xl bg-white/5 group-hover:border-primary/50 transition-all duration-500">
                  <div className="absolute inset-0 bg-neutral-900/30" />
                  
                  {item.logo ? (
                    <Image src={item.logo} alt={item.name} fill className="object-contain transition-transform duration-700 group-hover:scale-110 z-10" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Share2 size={40} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center px-1">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                    {item.name} {item.flag}
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