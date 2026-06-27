'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Tv, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobalSettings } from '@/firebase/settings-context';

export default function OttServicesPage() {
  const db = useFirestore();
  const { siteSettings } = useGlobalSettings();
  
  const ottQuery = useMemo(() => query(
    collection(db, 'games'),
    where('category', '==', 'OTT Services'),
    where('status', '==', 'active'),
    orderBy('sortOrder', 'asc')
  ), [db]);

  const { data: items, loading } = useCollection(ottQuery);

  const handleWhatsAppOrder = (serviceName: string) => {
    const whatsappNumber = siteSettings?.contactWhatsApp?.replace(/\D/g, '') || "918566936666";
    const message = `Hello Aatma HUB,\nI want to order ${serviceName}.\n\nPlease provide available options and pricing.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none">OTT Hub</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Premium Streaming Access</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-20 text-center space-y-4">
           <Tv className="h-10 w-10 text-muted-foreground mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Streaming Registry Empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col p-4 shadow-xl">
              <div className="relative aspect-square w-full mb-4 bg-white/5 rounded-xl overflow-hidden">
                {item.logo ? (
                  <Image 
                    src={item.logo} 
                    alt={item.name} 
                    fill 
                    className="object-contain p-4" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Tv size={40} className="text-white" />
                  </div>
                )}
              </div>
              <div className="text-center space-y-4 mt-auto">
                <h3 className="text-xs font-black text-white uppercase tracking-tight">
                  {item.name}
                </h3>
                <Button 
                  onClick={() => handleWhatsAppOrder(item.name)}
                  className="w-full h-10 bg-accent hover:bg-accent/90 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 shadow-xl"
                >
                  <MessageCircle size={14} />
                  Order via WhatsApp
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
