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
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Minimum recharge is ₹10.' });
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const whatsappNumber = siteSettings?.contactWhatsApp?.replace(/\D/g, '') || "918566936666";
    const message = `*DEPOSIT REQUEST*\n\n*Amount:* ₹${numAmount}\n*User Email:* ${user.email}\n*User ID:* ${user.uid}\n\nPlease provide payment details to add funds to my wallet.`;
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    toast({ title: "Request Initialized", description: "Opening Support WhatsApp for payment instructions." });
  };

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700 pb-20 text-foreground">
      <header className="flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-none hover:bg-white/5"><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none text-white">Add Funds</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Recharge your wallet balance</p>
        </div>
      </header>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount to Recharge (₹)</Label>
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
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">How to Recharge</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
            1. Enter amount and click "Add Funds via WhatsApp"<br/>
            2. Share payment screenshot on our support chat<br/>
            3. Balance will be added to your account within 5-10 minutes
          </p>
        </div>

        <Button 
          className="w-full h-16 text-sm font-black uppercase tracking-[0.2em] shadow-2xl rounded-none transition-all group gap-3 bg-primary hover:bg-secondary shadow-primary/20"
          onClick={handleManualRequest}
        >
          <MessageCircle className="h-5 w-5" />
          Add Funds via WhatsApp
        </Button>

        <div className="flex items-center justify-center gap-3 py-6 opacity-40"><ShieldCheck className="h-4 w-4" /><span className="text-[8px] font-black uppercase tracking-[0.4em]">Official Support Channel</span></div>
      </div>
    </div>
  );
}
