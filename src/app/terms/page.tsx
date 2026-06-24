'use client';

import { FileText, UserCheck, ShieldAlert, Ban } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="flex flex-col w-full p-4 space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="py-8">
        <h1 className="text-4xl font-headline font-black tracking-tighter uppercase mb-2">Terms & Conditions</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Legal Framework v2.1</p>
      </header>

      <div className="max-w-4xl space-y-8">
        <p className="text-sm text-white/70 uppercase tracking-widest font-medium leading-relaxed">
          By using the Aatma HUB platform, you agree to abide by the following terms and guidelines. These terms ensure a safe and reliable marketplace for all users.
        </p>

        <div className="grid gap-8">
          <TermItem 
            icon={UserCheck} 
            title="User Responsibility"
            points={[
              "Provide accurate and up-to-date account information.",
              "Users are responsible for maintaining the confidentiality of their credentials.",
              "Use only supported and legitimate payment methods."
            ]}
          />

          <TermItem 
            icon={FileText} 
            title="Platform Rules"
            points={[
              "Follow all platform rules and digital fulfillment policies.",
              "Abide by regional restrictions for specific game top-ups.",
              "Communication with support must remain professional and respectful."
            ]}
          />

          <TermItem 
            icon={ShieldAlert} 
            title="Anti-Fraud Policy"
            points={[
              "Avoid any fraudulent activities or unauthorized chargebacks.",
              "Exploiting site vulnerabilities will lead to permanent restriction.",
              "Accounts involved in suspicious activity will be flagged for review."
            ]}
          />

          <TermItem 
            icon={Ban} 
            title="Right to Terminate"
            points={[
              "Aatma HUB reserves the right to cancel suspicious orders.",
              "We may restrict or terminate accounts involved in abuse or fraud.",
              "Decisions made by our security team are final."
            ]}
          />
        </div>

        <div className="p-6 border border-white/5 bg-black/20 text-center space-y-2">
           <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em]">AATMA HUB DIGITAL PROTOCOL</p>
        </div>
      </div>
    </div>
  );
}

function TermItem({ icon: Icon, title, points }: any) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 border-l-2 border-primary pl-4">
        <Icon size={20} className="text-primary" />
        <h2 className="text-lg font-black uppercase tracking-tighter text-white">{title}</h2>
      </div>
      <ul className="space-y-3 pl-12">
        {points.map((point: string, i: number) => (
          <li key={i} className="text-[11px] text-muted-foreground uppercase tracking-widest flex items-start gap-2">
            <div className="h-1 w-1 rounded-full bg-primary mt-1.5 shrink-0" />
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}
