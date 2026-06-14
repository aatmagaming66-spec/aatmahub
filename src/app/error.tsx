
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Zap } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center animate-in fade-in duration-700">
      <div className="h-20 w-20 bg-accent/20 rounded-full flex items-center justify-center mb-6">
        <Zap className="h-10 w-10 text-accent" />
      </div>
      <h1 className="text-3xl font-headline font-black uppercase tracking-tighter text-white mb-2">System Breach</h1>
      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black max-w-xs mb-8 leading-relaxed">
        An unexpected anomaly has been detected in the HUB protocol. Security measures have been engaged.
      </p>
      <Button 
        onClick={() => reset()}
        className="bg-accent hover:bg-primary h-14 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] gap-3"
      >
        <RefreshCcw className="h-4 w-4" /> Restart Protocol
      </Button>
    </div>
  );
}
