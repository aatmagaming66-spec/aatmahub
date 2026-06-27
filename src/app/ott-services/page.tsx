'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Tv, MessageCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobalSettings } from '@/firebase/settings-context';
import { cn } from '@/lib/utils';

export default function OttServicesPage() {
  const db = useFirestore();
  const { siteSettings } = useGlobalSettings();
  
  const ottQuery = useMemo(() => query(
    collection(db, 'games'),
    where('category', '==', 'OTT Services'),
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
          {items.map((item) => {
            const isActive = item.status === 'active';
            return (
              <div key={item.id} className={cn(
                "bg-card border border-border rounded-2xl overflow-hidden flex flex-col p-4 shadow-xl relative",
                !isActive && "opacity-70"
              )}>
                <div className="relative aspect-square w-full mb-4 bg-white/5 rounded-xl overflow-hidden">
                  {item.logo ? (
                    <Image 
                      src={item.logo} 
                      alt={item.name} 
                      fill 
                      className={cn(
                        "object-contain p-4 transition-all",
                        isActive ? "opacity-100" : "opacity-30 grayscale"
                      )} 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Tv size={40} className="text-white" />
                    </div>
                  )}

                  {!isActive && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-2">
                      <div className="bg-primary/20 border border-primary/40 px-2 py-1 rounded shadow-[0_0_12px_rgba(220,38,38,0.5)] transform -rotate-12 animate-pulse">
                        <span className="text-[8px] font-black text-white uppercase tracking-tighter flex items-center gap-1">
                          OUT OF STOCK <Zap size={8} className="fill-current" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center space-y-4 mt-auto">
                  <h3 className={cn(
                    "text-xs font-black uppercase tracking-tight",
                    isActive ? "text-white" : "text-white/20"
                  )}>
                    {item.name}
                  </h3>
                  <Button 
                    onClick={() => isActive && handleWhatsAppOrder(item.name)}
                    disabled={!isActive}
                    className={cn(
                      "w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 shadow-xl",
                      isActive ? "bg-accent hover:bg-accent/90" : "bg-white/5 text-white/20"
                    )}
                  >
                    <MessageCircle size={14} />
                    Order via WhatsApp
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
