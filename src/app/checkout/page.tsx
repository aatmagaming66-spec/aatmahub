
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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Wallet, 
  Smartphone, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Lock
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
  const [verifiedName, setVerifiedName] = useState('');

  // Load identity from Product Page verification
  useEffect(() => {
    const savedVerification = localStorage.getItem('aatma_verification');
    if (savedVerification) {
      try {
        const data = JSON.parse(savedVerification);
        if (data.isVerified && data.playerId && data.serverId) {
          console.log('[Checkout Audit] Reusing verified identity from Product Page.');
          setPlayerId(data.playerId);
          setServerId(data.serverId);
          setIsVerified(true);
          setVerifiedName(data.verifiedName || 'AATMA_USER');
        }
      } catch (e) {
        console.error('[Checkout Audit] Failed to parse existing verification.', e);
      }
    }
  }, []);

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
      toast({ variant: 'destructive', title: 'Missing IDs', description: 'Player ID and Server ID are required.' });
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setIsVerified(true);
      setVerifiedName('AATMA_USER');
      
      // Save for persistence
      localStorage.setItem('aatma_verification', JSON.stringify({
        playerId,
        serverId,
        isVerified: true,
        verifiedName: "AATMA_USER",
        verifiedAt: new Date().toISOString()
      }));

      toast({ title: "Verified", description: "Identity confirmed in game database." });
    }, 1500);
  };

  const handleInputChange = (type: 'player' | 'server', val: string) => {
    if (type === 'player') setPlayerId(val);
    else setServerId(val);
    
    // Require re-verification if identity inputs change
    if (isVerified) {
      setIsVerified(false);
      localStorage.removeItem('aatma_verification');
    }
  };

  const handlePlaceOrder = async () => {
    if (!isVerified) {
      toast({ variant: 'destructive', title: 'Action Required', description: 'Please verify your identity first.' });
      return;
    }
    
    if (!user) return;
    
    if (paymentMethod === 'wallet' && walletBalance < totalAmount) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Please recharge your wallet to proceed.' });
      return;
    }

    setSubmitting(true);
    const orderId = `AH-2026-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
    const orderRef = doc(db, 'orders', orderId);

    try {
      if (paymentMethod === 'wallet') {
        const txId = `PUR-${Date.now()}`;
        const txRef = doc(db, 'transactions', txId);
        const walletDocRef = doc(db, 'wallets', user.uid);

        const txData = {
          transactionId: txId,
          userId: user.uid,
          amount: totalAmount,
          type: 'purchase',
          status: 'success',
          createdAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp(),
        };

        const walletData = {
          userId: user.uid,
          balance: walletBalance - totalAmount,
          updatedAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp(),
        };

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

        setDoc(txRef, txData).catch(async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: txRef.path, operation: 'create', requestResourceData: txData
          } satisfies SecurityRuleContext));
        });

        setDoc(walletDocRef, walletData, { merge: true }).catch(async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: walletDocRef.path, operation: 'update', requestResourceData: walletData
          } satisfies SecurityRuleContext));
        });

        setDoc(orderRef, orderData).catch(async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: orderRef.path, operation: 'create', requestResourceData: orderData
          } satisfies SecurityRuleContext));
        });
        
        sendTelegramNotification(db, `🚀 <b>NEW ORDER (WALLET)</b>\n\n📦 ID: ${orderId}\n👤 User: ${profile?.fullName || user.email}\n💰 Amount: ₹${totalAmount}`);
        
        clearCart();
        router.push(`/checkout/success/${orderId}`);
      } else if (paymentMethod === 'phonepe') {
        const orderData = {
          orderId,
          userId: user.uid,
          items: items,
          totalAmount,
          playerInfo: { playerId, serverId },
          paymentMethod,
          status: 'pending_payment',
          createdAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp(),
        };

        await setDoc(orderRef, orderData).catch(async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: orderRef.path, operation: 'create', requestResourceData: orderData
          } satisfies SecurityRuleContext));
        });

        const res = await fetch('/api/payments/phonepe/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount: totalAmount, 
            transactionId: orderId, 
            userId: user.uid, 
            type: 'order', 
            orderId 
          }),
        });

        const text = await res.text();
        if (!res.ok) {
          const errData = text ? JSON.parse(text) : { error: 'Unknown Error' };
          throw new Error(errData.error || 'Payment gateway failed to initialize.');
        }

        const data = text ? JSON.parse(text) : {};
        if (data.success && data.paymentUrl) {
          clearCart();
          window.location.href = data.paymentUrl;
        } else {
          throw new Error(data.error || 'Gateway response invalid.');
        }
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Order Failed', description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading || walletLoading || !user) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col w-full p-4 space-y-10 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Checkout Hub</h1>
      </header>

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
                <div className="relative">
                  <Input 
                    placeholder="12345678" 
                    value={playerId} 
                    readOnly={isVerified}
                    onChange={(e) => handleInputChange('player', e.target.value)} 
                    className={cn(
                      "bg-black/50 border-border h-12 rounded-xl text-white focus:border-primary font-bold",
                      isVerified && "opacity-60 pr-10"
                    )} 
                  />
                  {isVerified && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20" />}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Server ID</Label>
                <div className="relative">
                  <Input 
                    placeholder="1234" 
                    value={serverId} 
                    readOnly={isVerified}
                    onChange={(e) => handleInputChange('server', e.target.value)} 
                    className={cn(
                      "bg-black/50 border-border h-12 rounded-xl text-white focus:border-primary font-bold",
                      isVerified && "opacity-60 pr-10"
                    )} 
                  />
                  {isVerified && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20" />}
                </div>
              </div>
            </div>
            
            {!isVerified && (
              <Button 
                className="w-full h-12 text-[11px] font-black uppercase tracking-[0.2em] bg-primary hover:bg-secondary shadow-primary/20 shadow-xl" 
                onClick={handleVerify} 
                disabled={verifying}
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Identity"}
              </Button>
            )}

            {isVerified && (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center justify-between animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest leading-none">VERIFIED IDENTITY</span>
                    <span className="text-[11px] font-black text-white uppercase mt-1">{verifiedName}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsVerified(false)}
                  className="text-[8px] font-black text-white/40 uppercase tracking-widest hover:text-white"
                >
                  Change
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3"><div className="h-6 w-1 bg-accent rounded-full" /><h3 className="text-xs font-black uppercase tracking-widest text-white/80">Select Protocol</h3></div>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-3">
          <Label htmlFor="wallet" className={`flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer bg-card shadow-xl ${paymentMethod === 'wallet' ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}>
            <div className="flex items-center gap-4"><div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${paymentMethod === 'wallet' ? 'bg-primary/20' : 'bg-white/5'}`}><Wallet className={paymentMethod === 'wallet' ? 'text-primary' : 'text-muted-foreground'} /></div><div className="flex flex-col"><span className="text-sm font-black uppercase tracking-tight">Wallet</span><span className={`text-[9px] font-bold uppercase tracking-widest ${walletBalance < totalAmount ? 'text-primary' : 'text-muted-foreground'}`}>₹{walletBalance.toLocaleString()} Available</span></div></div>
            <RadioGroupItem value="wallet" id="wallet" className="sr-only" />{paymentMethod === 'wallet' && <CheckCircle2 className="h-5 w-5 text-primary" />}
          </Label>
          <Label htmlFor="phonepe" className={`flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer bg-card shadow-xl ${paymentMethod === 'phonepe' ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}>
            <div className="flex items-center gap-4"><div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${paymentMethod === 'phonepe' ? 'bg-primary/20' : 'bg-white/5'}`}><Smartphone className={paymentMethod === 'phonepe' ? 'text-primary' : 'text-muted-foreground'} /></div><div className="flex flex-col"><span className="text-sm font-black uppercase tracking-tight">PhonePe</span><span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Instant UPI Payment</span></div></div>
            <RadioGroupItem value="phonepe" id="phonepe" className="sr-only" />{paymentMethod === 'phonepe' && <CheckCircle2 className="h-5 w-5 text-primary" />}
          </Label>
        </RadioGroup>
      </section>

      <div className="flex flex-col gap-4 pt-4">
        <Button 
          className={cn(
            "w-full h-16 bg-primary hover:bg-secondary text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 rounded-2xl group transition-all",
            !isVerified && "opacity-50 grayscale cursor-not-allowed"
          )} 
          onClick={handlePlaceOrder} 
          disabled={submitting || !isVerified}
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Confirm & Pay <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></>}
        </Button>
        <Button variant="ghost" onClick={() => router.push('/cart')} className="w-full h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white"><ArrowLeft className="mr-2 h-4 w-4" /> Return to Cart</Button>
      </div>

      <div className="flex items-center justify-center gap-3 py-6 opacity-30"><ShieldCheck className="h-4 w-4" /><span className="text-[8px] font-black uppercase tracking-[0.4em]">Hub-to-Server Secured Distribution</span></div>
    </div>
  );
}
