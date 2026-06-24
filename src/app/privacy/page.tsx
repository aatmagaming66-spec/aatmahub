'use client';

import { ShieldCheck, Lock, Eye, Server } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col w-full p-4 space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="py-8">
        <h1 className="text-4xl font-headline font-black tracking-tighter uppercase mb-2">Privacy Policy</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Last Updated: February 2025</p>
      </header>

      <div className="max-w-4xl space-y-8">
        <div className="grid gap-6">
          <PrivacySection 
            icon={ShieldCheck} 
            title="Data Protection"
            content="Aatma HUB respects user privacy and protects customer information. We use robust security measures to ensure your data remains confidential and secure from unauthorized access."
          />
          
          <PrivacySection 
            icon={Server} 
            title="Data Collection"
            content="We collect only the information required to process orders, provide support and improve services. This includes your name, email address, and game identifiers necessary for digital fulfillment."
          />

          <PrivacySection 
            icon={Eye} 
            title="Third Party Sharing"
            content="Customer information is never sold to third parties. We only share necessary data with our trusted fulfillment and payment partners to complete your transactions."
          />

          <PrivacySection 
            icon={Lock} 
            title="Secure Payments"
            content="All payments are processed through secure payment gateways with high-level encryption. Aatma HUB does not store your full financial details on our servers."
          />
        </div>

        <Card className="bg-primary/5 border-primary/20 rounded-none">
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-white uppercase tracking-wider leading-relaxed">
              By using Aatma HUB, users agree to this privacy policy. We are committed to maintaining the highest standards of data integrity for our gaming community.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PrivacySection({ icon: Icon, title, content }: any) {
  return (
    <section className="space-y-4 group">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
          <Icon size={16} />
        </div>
        <h2 className="text-lg font-black uppercase tracking-tight text-white">{title}</h2>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-widest pl-11">
        {content}
      </p>
    </section>
  );
}
