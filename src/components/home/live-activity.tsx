'use client';

import { useEffect, useState, useMemo } from "react";
import { Zap, ShoppingBag } from "lucide-react";
import { useFirestore } from "@/firebase/provider";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";

export function LiveActivity() {
  const db = useFirestore();
  const [index, setIndex] = useState(0);

  // Fetch real recent orders
  const activityQuery = useMemo(() => query(
    collection(db, 'orders'),
    where('status', '==', 'completed'),
    orderBy('createdAt', 'desc'),
    limit(10)
  ), [db]);

  const { data: orders } = useCollection(activityQuery);

  useEffect(() => {
    if (!orders || orders.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % orders.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [orders]);

  if (!orders || orders.length === 0) return null;

  return (
    <section className="px-4 mt-6 mb-2 animate-in fade-in duration-700">
      <div className="bg-card/40 border border-white/5 rounded-none p-4 flex flex-col gap-2 relative overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </div>
          <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Live Deliveries</span>
        </div>
        
        <div className="relative h-[24px] overflow-hidden">
          {orders.map((order, i) => {
            const isVisible = i === index;
            const buyerName = order.playerInfo?.verifiedName || "Member";
            const itemName = order.items?.[0]?.name || "Digital Item";
            const orderRef = order.orderId?.slice(-6).toUpperCase();

            return (
              <div 
                key={order.id} 
                className={`absolute w-full h-full flex items-center justify-between transition-all duration-700 ease-in-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <ShoppingBag size={10} className="text-primary shrink-0" />
                  <span className="text-[10px] font-black text-white/90 truncate uppercase">
                    {buyerName.split(' ')[0]} purchased <span className="text-primary">{itemName}</span>
                  </span>
                </div>
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest shrink-0">
                  ID: {orderRef}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
