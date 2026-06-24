'use client';

import { RefreshCcw, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col w-full p-4 space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="py-8">
        <h1 className="text-4xl font-headline font-black tracking-tighter uppercase mb-2">Refund Policy</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Digital Asset Protection Protocol</p>
      </header>

      <div className="max-w-4xl space-y-12">
        <section className="bg-card border border-border p-8 rounded-none relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><RefreshCcw size={180} className="text-accent" /></div>
          <div className="relative z-10 space-y-4">
            <h2 className="text-xl font-black uppercase text-accent tracking-widest">Eligibility Criteria</h2>
            <p className="text-sm text-white/80 uppercase tracking-widest leading-relaxed">
              Refunds are reviewed manually and may be provided in the following specific scenarios:
            </p>
            <ul className="space-y-3 pt-2">
              <EligibilityItem icon={CheckCircle2} text="Payment succeeds but digital service is not delivered within 24 hours." />
              <EligibilityItem icon={CheckCircle2} text="Duplicate payments occur due to system or gateway errors." />
              <EligibilityItem icon={CheckCircle2} text="Technical issues prevent order completion from our provider's end." />
            </ul>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card border-border rounded-none p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 flex items-center justify-center text-primary"><ShieldCheck size={20} /></div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Non-Refundable</h3>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold leading-relaxed">
              Refunds are strictly unavailable once digital fulfillment is successful. We are not responsible for incorrect Player IDs or Server IDs provided by users.
            </p>
          </Card>

          <Card className="bg-card border-border rounded-none p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-accent/10 flex items-center justify-center text-accent"><Clock size={20} /></div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Review Process</h3>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold leading-relaxed">
              All refund requests are reviewed manually by our administration team. The standard review time is 2-3 business days.
            </p>
          </Card>
        </div>

        <div className="text-center py-6 border-t border-white/5">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">
            Submit refund requests via the Support Center with your Order ID.
          </p>
        </div>
      </div>
    </div>
  );
}

function EligibilityItem({ icon: Icon, text }: any) {
  return (
    <li className="flex items-start gap-3">
      <Icon size={14} className="text-accent mt-0.5 shrink-0" />
      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-relaxed">{text}</span>
    </li>
  );
}
