
"use client"

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

// Removed hardcoded transaction logs
const RECENT_ACTIVITY: any[] = [];

export function LiveActivity() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (RECENT_ACTIVITY.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % RECENT_ACTIVITY.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  if (RECENT_ACTIVITY.length === 0) return null;

  return (
    <section className="px-4 mt-6 mb-2">
      <div className="bg-card/30 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          <div className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
          </div>
          <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em]">Live Feed</span>
        </div>
        
        <div className="relative h-[44px] overflow-hidden">
          {RECENT_ACTIVITY.map((activity, i) => {
            let position = i - index;
            if (position < -1) position += RECENT_ACTIVITY.length;
            if (position > RECENT_ACTIVITY.length - 2) position -= RECENT_ACTIVITY.length;
            const isVisible = position === 0 || position === 1;

            return (
              <div 
                key={i} 
                className="absolute w-full h-[22px] flex items-center justify-between px-0.5 transition-all"
                style={{ 
                  transform: `translateY(${position * 22}px)`,
                  opacity: isVisible ? 1 : 0
                }}
              >
                <div className="flex items-center gap-2 truncate">
                  <Zap size={7} className="text-primary shrink-0" />
                  <span className="text-primary text-[9px] font-black shrink-0">{activity.id}</span>
                  <span className="text-white/60 text-[9px] font-bold truncate uppercase">{activity.product}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
