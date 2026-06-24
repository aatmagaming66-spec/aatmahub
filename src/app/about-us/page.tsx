'use client';

import { ShieldCheck, Target, Zap, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutUsPage() {
  return (
    <div className="flex flex-col w-full p-4 space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="py-8 text-center">
        <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase mb-2">
          About <span className="text-primary">Aatma</span> HUB
        </h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-black opacity-60">
          The Pinnacle of Digital Gaming Services
        </p>
      </header>

      <div className="max-w-4xl mx-auto w-full space-y-12">
        <section className="bg-card border border-border p-8 rounded-none relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12"><Trophy size={200} className="text-primary" /></div>
          <div className="relative z-10 space-y-6">
            <p className="text-lg font-medium text-white leading-relaxed uppercase tracking-wide">
              Aatma HUB is a premium gaming topup and digital services platform focused on delivering fast, secure and reliable digital products.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed uppercase tracking-wider">
              We provide gaming topups, recharge services and digital solutions with a smooth customer experience, secure payments and responsive support. Our mission is to bridge the gap between gamers and the digital assets they need to succeed in their virtual worlds.
            </p>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Zap} 
            title="Fast Delivery" 
            desc="Automated systems ensuring your digital assets reach you in record time."
            color="text-primary"
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="Secure Payments" 
            desc="Industry-standard encryption and verified gateways for every transaction."
            color="text-accent"
          />
          <FeatureCard 
            icon={Target} 
            title="Our Goal" 
            desc="To become the most trusted destination for gamers and digital customers worldwide."
            color="text-primary"
          />
        </div>

        <section className="text-center space-y-4 pt-10">
          <div className="h-px w-24 bg-primary mx-auto" />
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Trusted by Thousands of Gamers</p>
          <p className="text-xs text-muted-foreground uppercase tracking-widest max-w-lg mx-auto">
            Experience the difference with Aatma HUB – where gaming meets reliability.
          </p>
        </section>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: any) {
  return (
    <Card className="bg-card border-border rounded-none shadow-xl group hover:border-primary/40 transition-all">
      <CardContent className="p-6 space-y-4">
        <div className={`h-12 w-12 rounded-none bg-white/5 flex items-center justify-center ${color}`}>
          <Icon size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-tight text-white">{title}</h3>
          <p className="text-[10px] text-muted-foreground uppercase font-bold leading-relaxed">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}
