"use client"

import { Zap } from "lucide-react";

const RECENT_ACTIVITY = [
  { id: "AH_88**", product: "86 Diamonds", time: "1m ago" },
  { id: "AH_12**", product: "Weekly Pass", time: "3m ago" },
];

export function LiveActivity() {
  return (
    <section className="px-4 mt-8 mb-2">
      <div className="bg-card/30 border border-white/5 rounded-2xl p-3 flex flex-col gap-2 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </div>
          <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Live Feed Distribution</span>
        </div>
        
        <div className="space-y-1.5">
          {RECENT_ACTIVITY.map((activity, i) => (
            <div key={i} className="flex items-center justify-between text-[10px] font-bold">
              <div className="flex items-center gap-2">
                <span className="text-primary">{activity.id}</span>
                <span className="text-white/60 tracking-tight">purchased {activity.product}</span>
              </div>
              <div className="flex items-center gap-1 text-accent">
                <Zap size={8} />
                <span className="text-[8px] uppercase">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
