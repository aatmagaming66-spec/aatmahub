
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center animate-in fade-in duration-700">
      <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-6xl font-headline font-black uppercase tracking-tighter text-white mb-2">404</h1>
      <h2 className="text-xl font-bold uppercase tracking-widest text-primary mb-4">Signal Lost</h2>
      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black max-w-xs mb-8">
        The sector you are trying to reach does not exist in the HUB database.
      </p>
      <Link href="/">
        <Button className="bg-primary hover:bg-secondary h-14 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/20">
          Return to Base
        </Button>
      </Link>
    </div>
  );
}
