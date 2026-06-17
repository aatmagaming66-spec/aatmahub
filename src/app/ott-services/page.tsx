
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Tv } from 'lucide-react';

export default function OttServicesPage() {
  const db = useFirestore();
  
  const ottQuery = useMemo(() => query(
    collection(db, 'games'),
    where('category', '==', 'OTT Services'),
    where('status', '==', 'active'),
    orderBy('sortOrder', 'asc')
  ), [db]);

  const { data: items, loading } = useCollection(ottQuery);

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none">OTT Hub</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Premium Streaming Access</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-[24px] bg-white/5" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[2.5rem] p-20 text-center space-y-4">
           <Tv className="h-10 w-10 text-muted-foreground mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Streaming Registry Empty</p>
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
                <div className="relative aspect-video w-full rounded-[24px] overflow-hidden mb-3 border border-border shadow-2xl bg-card group-hover:border-accent/50 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-black to-card" />
                  
                  {item.logo ? (
                    <Image src={item.logo} alt={item.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Tv size={40} className="text-white" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
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
