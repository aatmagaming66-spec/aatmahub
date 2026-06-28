
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Send, Mail, ShieldCheck, MapPin } from 'lucide-react';

const CONTACT_METHODS = [
  {
    icon: MessageCircle,
    label: 'WhatsApp Support',
    value: '+91 8566936666',
    link: 'https://wa.me/918566936666',
    color: 'text-green-500',
    bg: 'bg-green-500/10'
  },
  {
    icon: Send,
    value: '@aatmaplays',
    color: 'text-primary',
    bg: 'bg-primary/10'
  },
  {
    icon: Mail,
    label: 'Email Inquiries',
    value: 'shivatetz@gmail.com',
    link: 'mailto:shivatetz@gmail.com',
    color: 'text-accent',
    bg: 'bg-accent/10'
  }
];

export default function ContactPage() {
  return (
    <div className="flex flex-col w-full p-4 space-y-10 animate-in fade-in duration-700">
      <header className="py-6">
        <h1 className="text-4xl font-headline font-black tracking-tighter uppercase mb-1">Contact HUB</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">24/7 Digital Operations Support</p>
      </header>

      <div className="grid gap-4">
        {CONTACT_METHODS.map((method, i) => (
          <a key={i} href={method.link} target="_blank" rel="noopener noreferrer">
            <Card className="bg-card border-border rounded-3xl overflow-hidden hover:border-primary/40 transition-all active:scale-[0.98] group">
              <CardContent className="p-6 flex items-center gap-5">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${method.bg} border border-white/5`}>
                  <method.icon className={`h-6 w-6 ${method.color}`} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{method.label}</p>
                  <p className="text-lg font-black text-white group-hover:text-primary transition-colors">{method.value}</p>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      <div className="space-y-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 bg-white rounded-full" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Operational Hub</h3>
        </div>
        <Card className="bg-card border-border rounded-3xl p-6 space-y-4">
          <div className="flex items-start gap-4">
             <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
               <MapPin className="h-5 w-5 text-white/40" />
             </div>
             <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Corporate HQ</p>
                <p className="text-xs font-bold text-white uppercase leading-relaxed">
                  AATMA HUB DIGITAL SERVICES<br/>
                  Lambhua, Sultanpur<br/>
                  Uttar Pradesh, India – 222302
                </p>
             </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-center gap-3 py-6 opacity-30">
        <ShieldCheck className="h-4 w-4" />
        <span className="text-[8px] font-black uppercase tracking-[0.4em]">AATMA HUB SECURED CHANNEL</span>
      </div>
    </div>
  );
}
