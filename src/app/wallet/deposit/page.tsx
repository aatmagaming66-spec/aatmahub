'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MessageCircle, ShieldCheck, Info } from 'lucide-react';
import { useGlobalSettings } from '@/firebase/settings-context';

export default function DepositPage() {
  const [amount, setAmount] = useState('');
  const { user } = useUser();
  const { siteSettings } = useGlobalSettings();
  const { toast } = useToast();
  const router = useRouter();

  const handleManualRequest = () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 10) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Minimum recharge request is ₹10.' });
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const whatsappNumber = siteSettings?.contactWhatsApp?.replace(/\D/g, '') || "918566936666";
    const message = `*MANUAL RECHARGE REQUEST*\n\n*Amount:* ₹${numAmount}\n*User Email:* ${user.email}\n*User UID:* ${user.uid}\n\nPlease provide payment details to complete this top-up.`;
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    toast({ title: "Request Initialized", description: "Redirecting to Support for manual fulfillment." });
  };

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700 pb-20 text-foreground">
      <header className="flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-none hover:bg-white/5"><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none text-white">Recharge Hub</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Manual Credit Request</p>
        </div>
      </header>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Enter Requested Amount (₹)</Label>
          <Input 
            type="number" 
            placeholder="Min ₹10" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            className="bg-card border-border h-16 rounded-none text-3xl font-black text-primary focus:border-primary px-6" 
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {['100', '500', '1000', '2000'].map((val) => (
            <Button key={val} variant="outline" onClick={() => setAmount(val)} className="bg-card border-border h-12 rounded-none text-[10px] font-black uppercase hover:border-primary hover:text-primary active-press">+₹{val}</Button>
          ))}
        </div>

        <div className="bg-white/5 p-6 rounded-none border border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Manual Fulfillment Protocol</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
            1. Enter amount and click "Request Manual Top-up"<br/>
            2. You will be redirected to Support WhatsApp<br/>
            3. Share payment proof via screenshot<br/>
            4. Balance will be added to your wallet within 2-5 minutes
          </p>
        </div>

        <Button 
          className="w-full h-16 text-sm font-black uppercase tracking-[0.2em] shadow-2xl rounded-none transition-all group gap-3 bg-primary hover:bg-secondary shadow-primary/20"
          onClick={handleManualRequest}
        >
          <MessageCircle className="h-5 w-5" />
          Request Manual Top-up
        </Button>

        <div className="flex items-center justify-center gap-3 py-6 opacity-40"><ShieldCheck className="h-4 w-4" /><span className="text-[8px] font-black uppercase tracking-[0.4em]">Verified Aatma Hub Support Channel</span></div>
      </div>
    </div>
  );
}