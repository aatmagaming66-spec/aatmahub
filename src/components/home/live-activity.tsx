"use client"

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

const RECENT_ACTIVITY = [
  { id: "AH_88**", product: "86 Diamonds", time: "1m ago" },
  { id: "AH_12**", product: "Weekly Pass", time: "3m ago" },
  { id: "AH_45**", product: "Monthly Pass", time: "5m ago" },
  { id: "AH_99**", product: "172 Diamonds", time: "7m ago" },
  { id: "AH_32**", product: "Netflix Prem", time: "10m ago" },
  { id: "AH_21**", product: "86 Diamonds", time: "12m ago" },
  { id: "AH_67**", product: "Spotify Prem", time: "15m ago" },
  { id: "AH_54**", product: "Genshin Welkin", time: "18m ago" },
];

export function LiveActivity() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % RECENT_ACTIVITY.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="px-4 mt-6 mb-2">
      <div className="bg-card/30 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          <div className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
          </div>
          <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em]">Live Feed Distribution</span>
        </div>
        
        {/* Compact Vertical Auto-Slider - 2 lines visible, 1 line slide */}
        <div className="relative h-[44px] overflow-hidden">
          <div 
            className="flex flex-col transition-transform duration-700 ease-in-out"
            style={{ transform: `translateY(-${index * 22}px)` }}
          >
            {/* Map activity items - Duplicate first few items at end for smoother visual looping if needed */}
            {[...RECENT_ACTIVITY, RECENT_ACTIVITY[0]].map((activity, i) => (
              <div key={i} className="flex items-center justify-between h-[22px] px-0.5 shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <Zap size={7} className="text-primary shrink-0" />
                  <span className="text-primary text-[9px] font-black shrink-0">{activity.id}</span>
                  <span className="text-white/60 text-[9px] font-bold tracking-tight truncate uppercase">purchased {activity.product}</span>
                </div>
                <div className="flex items-center gap-1 text-white/20 shrink-0 ml-2">
                  <span className="text-[7px] uppercase font-black">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
