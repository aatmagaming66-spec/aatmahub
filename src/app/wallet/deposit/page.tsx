
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, ShieldCheck, CreditCard, Smartphone, CheckCircle2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { sendTelegramNotification } from '@/lib/telegram';

export default function DepositPage() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('phonepe');
  const [loading, setLoading] = useState(false);
  const { user, profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handleDeposit = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 10) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Minimum deposit is ₹10.' });
      return;
    }

    if (!user) return;

    setLoading(true);
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      if (paymentMethod === 'phonepe') {
        // 1. Create Pending Transaction
        await setDoc(doc(db, 'transactions', transactionId), {
          transactionId,
          userId: user.uid,
          amount: numAmount,
          type: 'deposit',
          status: 'pending_payment',
          paymentMethod: 'phonepe',
          createdAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp(),
        });

        // 2. Initiate PhonePe
        const res = await fetch('/api/payments/phonepe/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: numAmount,
            transactionId,
            userId: user.uid,
            type: 'deposit',
          }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Payment initiation failed');
        }
      } else {
        // Default manual approval logic (Razorpay/Manual)
        const txData = {
          transactionId,
          userId: user.uid,
          amount: numAmount,
          type: 'deposit',
          status: 'pending',
          createdAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp(),
        };
        await setDoc(doc(db, 'transactions', transactionId), txData);

        const tgMsg = `💰 <b>DEPOSIT REQUESTED</b>\n\n` +
          `👤 <b>User:</b> ${profile?.fullName}\n` +
          `💵 <b>Amount:</b> ₹${numAmount}\n` +
          `💳 <b>Method:</b> ${paymentMethod}\n` +
          `🔑 <b>TXN ID:</b> <code>${transactionId}</code>\n`;

        sendTelegramNotification(db, tgMsg, [
          [
            { text: '✅ Approve', callback_data: `approve_deposit:${transactionId}` },
            { text: '❌ Reject', callback_data: `reject_deposit:${transactionId}` }
          ]
        ]);

        toast({ title: 'Deposit Requested', description: `Request for ₹${numAmount} sent for admin approval.` });
        router.push('/wallet');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Request Failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="flex items-center gap-4 py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none">Add Money</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">HUB CREDIT RECHARGE</p>
        </div>
      </header>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Enter Amount (₹)</Label>
          <Input 
            type="number" 
            placeholder="Min ₹10" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-card border-border h-16 rounded-3xl text-3xl font-black text-primary focus:border-primary px-6"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {['100', '500', '1000', '2000'].map((val) => (
            <Button 
              key={val}
              variant="outline" 
              onClick={() => setAmount(val)}
              className="bg-card border-border h-12 rounded-2xl text-[10px] font-black uppercase hover:border-primary hover:text-primary"
            >
              +₹{val}
            </Button>
          ))}
        </div>

        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3 px-1">
            <div className="h-6 w-1 bg-primary rounded-full" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Select Payment Gate</h3>
          </div>

          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-3">
            <Label
              htmlFor="phonepe"
              className={`flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer bg-card shadow-xl ${paymentMethod === 'phonepe' ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${paymentMethod === 'phonepe' ? 'bg-primary/20' : 'bg-white/5'}`}>
                  <Smartphone className={paymentMethod === 'phonepe' ? 'text-primary' : 'text-muted-foreground'} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black uppercase tracking-tight">PhonePe</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Instant UPI Payment</span>
                </div>
              </div>
              <RadioGroupItem value="phonepe" id="phonepe" className="sr-only" />
              {paymentMethod === 'phonepe' && <CheckCircle2 className="h-5 w-5 text-primary" />}
            </Label>

            <Label
              htmlFor="razorpay"
              className={`flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer bg-card shadow-xl ${paymentMethod === 'razorpay' ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${paymentMethod === 'razorpay' ? 'bg-primary/20' : 'bg-white/5'}`}>
                  <CreditCard className={paymentMethod === 'razorpay' ? 'text-primary' : 'text-muted-foreground'} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black uppercase tracking-tight">Razorpay</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Cards, NetBanking, Wallet</span>
                </div>
              </div>
              <RadioGroupItem value="razorpay" id="razorpay" className="sr-only" />
              {paymentMethod === 'razorpay' && <CheckCircle2 className="h-5 w-5 text-primary" />}
            </Label>
          </RadioGroup>
        </div>

        <Button 
          className="w-full h-16 bg-primary hover:bg-secondary text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 rounded-2xl transition-all"
          onClick={handleDeposit}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Request ₹${amount || '0'} Deposit`}
        </Button>

        <div className="flex items-center justify-center gap-3 py-6 opacity-40">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[8px] font-black uppercase tracking-[0.4em]">End-to-End Encrypted Secure Gateway</span>
        </div>
      </div>
    </div>
  );
}
