'use client';

import { 
  MessageCircle, 
  HelpCircle, 
  Settings, 
  Package, 
  AlertTriangle, 
  UserCheck, 
  ArrowRight,
  Headphones
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const SUPPORT_TOPICS = [
  { icon: Package, label: 'Order Status', desc: 'Track your active and completed purchases.' },
  { icon: AlertTriangle, label: 'Payment Issues', desc: 'Help with failed or pending transactions.' },
  { icon: Zap, label: 'Topup Delays', desc: 'Assistance if your currency is taking time.' },
  { icon: HelpCircle, label: 'Refund Requests', desc: 'Start a manual review for eligible refunds.' },
  { icon: UserCheck, label: 'Account Verification', desc: 'Verify your ID for higher transaction limits.' },
  { icon: Settings, label: 'Technical Support', desc: 'Help with site bugs or interface issues.' },
];

export default function SupportPage() {
  return (
    <div className="flex flex-col w-full p-4 space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="py-8 text-center space-y-3">
        <div className="h-16 w-16 bg-primary/10 rounded-none flex items-center justify-center mx-auto border border-primary/20">
          <Headphones size={32} className="text-primary" />
        </div>
        <h1 className="text-4xl font-headline font-black tracking-tighter uppercase">Support Center</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-black opacity-60">Need assistance? We are here to help.</p>
      </header>

      <div className="max-w-5xl mx-auto w-full space-y-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUPPORT_TOPICS.map((topic, i) => (
            <Card key={i} className="bg-card border-border rounded-none shadow-lg hover:border-primary/30 transition-all group">
              <CardContent className="p-6 space-y-4">
                <div className="h-10 w-10 bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <topic.icon size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">{topic.label}</h3>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold leading-relaxed">{topic.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="bg-gradient-to-r from-primary/20 via-background to-accent/10 border border-white/5 p-8 rounded-none text-center space-y-6 shadow-2xl">
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-widest">Connect with Support</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">Fast response through our official channels</p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="https://wa.me/918566936666" target="_blank" className="flex-1 max-w-xs">
              <Button className="w-full h-14 bg-green-600 hover:bg-green-700 rounded-none font-black uppercase tracking-widest text-[10px] gap-3">
                <MessageCircle size={18} /> WhatsApp Support
              </Button>
            </Link>
            <Link href="/contact" className="flex-1 max-w-xs">
              <Button variant="outline" className="w-full h-14 border-border rounded-none font-black uppercase tracking-widest text-[10px] gap-3 hover:bg-white/5">
                Contact Hub <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </section>

        <p className="text-center text-[9px] text-white/30 uppercase font-black tracking-[0.3em]">
          Support Available 24/7 for Critical Issues
        </p>
      </div>
    </div>
  );
}
