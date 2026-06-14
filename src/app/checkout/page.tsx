
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Wallet, 
  CreditCard, 
  Smartphone, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Package,
  Info
} from 'lucide-react';
import { sendTelegramNotification } from '@/lib/telegram';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const { user, profile, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();

  const [playerId, setPlayerId] = useState('');
  const [serverId, setServerId] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Wallet Balance
  const walletRef = useMemo(() => user ? doc(db, 'wallets', user.uid) : null, [user, db]);
  const { data: wallet, loading: walletLoading } = useDoc(walletRef);

  const walletBalance = wallet?.balance || 0;

  useEffect(() => {
    if (!userLoading && !user) {
      toast({ variant: 'destructive', title: 'Session Required', description: 'Please login to complete your order.' });
      router.push('/login');
    } else if (!userLoading && items.length === 0) {
      router.push('/cart');
    }
  }, [user, userLoading, items, router, toast]);

  const handleVerify = () => {
    if (!playerId || !serverId) {
      toast({ variant: 'destructive', title: 'Incomplete Data', description: 'Player ID and Server ID are required.' });
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setIsVerified(true);
      toast({ title: "Verified", description: "Identity found in regional database." });
    }, 1500);
  };

  const generateOrderId = () => {
    const ts = Date.now().toString().slice(-6);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `AH-2026-${ts}${rand}`;
  };

  const handlePlaceOrder = async () => {
    if (!isVerified) {
      toast({ variant: 'destructive', title: 'Verify Identity', description: 'Please authenticate your Game ID before purchase.' });
      return;
    }

    if (!user) return;

    if (paymentMethod === 'wallet' && walletBalance < totalAmount) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Please recharge your wallet to complete this purchase.' });
      return;
    }

    setSubmitting(true);
    const orderId = generateOrderId();
    
    try {
      if (paymentMethod === 'wallet') {
        const txId = `PUR-${Date.now()}`;
        await setDoc(doc(db, 'transactions', txId), {
          transactionId: txId,
          userId: user.uid,
          amount: totalAmount,
          type: 'purchase',
          status: 'success',
          createdAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp(),
        });

        await setDoc(doc(db, 'wallets', user.uid), {
          balance: walletBalance - totalAmount,
          updatedAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp(),
        }, { merge: true });
      }

      const orderData = {
        orderId,
        userId: user.uid,
        items: items,
        totalAmount,
        playerInfo: { playerId, serverId },
        paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
      };

      await setDoc(doc(db, 'orders', orderId), orderData);
      
      // Send Telegram Notification
      const tgMsg = `🚀 <b>NEW ORDER PLACED</b>\n\n` +
        `📦 <b>Order ID:</b> ${orderId}\n` +
        `👤 <b>User:</b> ${profile?.fullName}\n` +
        `📱 <b>Product:</b> ${items[0].name}\n` +
        `🌐 <b>Region:</b> ${items[0].region}\n` +
        `🆔 <b>Player ID:</b> ${playerId}\n` +
        `🖥 <b>Server ID:</b> ${serverId}\n` +
        `💰 <b>Amount:</b> ₹${totalAmount}\n` +
        `💳 <b>Payment:</b> ${paymentMethod}\n` +
        `🕒 <b>Time:</b> ${new Date().toLocaleString()}`;

      sendTelegramNotification(db, tgMsg, [
        [
          { text: '⚙ Process', callback_data: `process_order:${orderId}` },
          { text: '🎉 Complete', callback_data: `complete_order:${orderId}` }
        ],
        [
          { text: '❌ Cancel', callback_data: `cancel_order:${orderId}` }
        ]
      ]);

      toast({ title: "Order Secure", description: `Transaction ${orderId} initialized.` });
      clearCart();
      router.push(`/checkout/success/${orderId}`);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Order Failed', description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading || walletLoading || !user) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-4 space-y-10 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Checkout Hub</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Finalize Digital Distribution</p>
      </header>

      {/* ID Verification */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 bg-primary rounded-full" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Target Destination</h3>
        </div>
        
        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Player ID</Label>
                <Input 
                  placeholder="12345678" 
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="bg-black/50 border-border h-12 rounded-xl text-white focus:border-primary font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Server ID</Label>
                <Input 
                  placeholder="1234" 
                  value={serverId}
                  onChange={(e) => setServerId(e.target.value)}
                  className="bg-black/50 border-border h-12 rounded-xl text-white focus:border-primary font-bold"
                />
              </div>
            </div>
            <Button 
              className="w-full h-12 bg-secondary hover:bg-white/5 border border-border text-[11px] font-black uppercase tracking-widest"
              onClick={handleVerify}
              disabled={verifying}
            >
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Identity"}
            </Button>

            {isVerified && (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest leading-none">Status: Secured & Validated</span>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Payment Selection */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 bg-accent rounded-full" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Select Protocol</h3>
        </div>
        
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-3">
          <Label
            htmlFor="wallet"
            className={`flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer bg-card shadow-xl ${paymentMethod === 'wallet' ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${paymentMethod === 'wallet' ? 'bg-primary/20' : 'bg-white/5'}`}>
                <Wallet className={paymentMethod === 'wallet' ? 'text-primary' : 'text-muted-foreground'} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-tight">Wallet</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${walletBalance < totalAmount ? 'text-primary' : 'text-muted-foreground'}`}>
                  ₹{walletBalance.toLocaleString()} Available
                </span>
              </div>
            </div>
            <RadioGroupItem value="wallet" id="wallet" className="sr-only" />
            {paymentMethod === 'wallet' && <CheckCircle2 className="h-5 w-5 text-primary" />}
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
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Global Payments</span>
              </div>
            </div>
            <RadioGroupItem value="razorpay" id="razorpay" className="sr-only" />
            {paymentMethod === 'razorpay' && <CheckCircle2 className="h-5 w-5 text-primary" />}
          </Label>
        </RadioGroup>
      </section>

      {/* Order Brief */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 bg-white rounded-full" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Hub Summary</h3>
        </div>

        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
          <CardContent className="p-6 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div className="flex flex-col">
                  <span className="font-black uppercase text-white/90">{item.name}</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Unit: ₹{item.price} • Qty: {item.quantity}</span>
                </div>
                <span className="font-black text-white">₹{item.price * item.quantity}</span>
              </div>
            ))}
            
            <div className="pt-4 border-t border-border flex justify-between items-end">
              <span className="text-sm font-black uppercase tracking-widest">Grand Total</span>
              <span className="text-3xl font-black text-primary tracking-tighter leading-none">₹{totalAmount}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Action Hub */}
      <div className="flex flex-col gap-4 pt-4">
        <Button 
          className="w-full h-16 bg-primary hover:bg-secondary text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 rounded-2xl group transition-all"
          onClick={handlePlaceOrder}
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Confirm Order
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => router.push('/cart')}
          className="w-full h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Return to Cart
        </Button>
      </div>

      <div className="flex items-center justify-center gap-3 py-6 opacity-30">
        <ShieldCheck className="h-4 w-4" />
        <span className="text-[8px] font-black uppercase tracking-[0.4em]">Hub-to-Server Secured Distribution</span>
      </div>
    </div>
  );
}
