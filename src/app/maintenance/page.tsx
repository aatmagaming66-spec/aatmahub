'use client';

import { ShieldAlert, Wrench, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background animate-in fade-in duration-700">
      <div className="relative mb-8">
        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
          <Wrench className="h-10 w-10 text-primary animate-bounce" />
        </div>
        <div className="absolute -top-2 -right-2 bg-accent p-2 rounded-full border-4 border-background">
          <ShieldAlert className="h-4 w-4 text-white" />
        </div>
      </div>
      
      <h1 className="text-4xl font-headline font-black uppercase tracking-tighter text-white mb-3">Maintenance</h1>
      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black max-w-xs mb-8 leading-relaxed">
        The website is currently undergoing scheduled maintenance to improve our services. We'll be back shortly.
      </p>

      <div className="bg-card border border-border p-6 rounded-3xl mb-8 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-accent" />
          <span className="text-[9px] font-black uppercase tracking-widest text-accent">Estimated Time</span>
        </div>
        <p className="text-sm font-bold text-white uppercase tracking-tight">Back in about 60 minutes</p>
      </div>

      <Link href="/contact">
        <Button variant="outline" className="border-border hover:bg-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8">
          Contact Support
        </Button>
      </Link>
    </div>
  );
}
