
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Wallet, 
  Smartphone, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  User,
  Package,
  Zap,
  Tag
} from 'lucide-react';
import { sendTelegramNotification } from '@/lib/telegram';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const { user, profile, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();

  const [verificationData, setVerificationData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [submitting, setSubmitting] = useState(false);

  // Load identity from Product Page verification
  useEffect(() => {
    const savedVerification = localStorage.getItem('aatma_verification');
    if (savedVerification) {
      try {
        const data = JSON.parse(savedVerification);
        if (data?.isVerified && data?.playerId && data?.serverId) {
          setVerificationData(data);
        } else {
          router.push('/');
        }
      } catch (e) {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  const walletRef = useMemo(() => user ? doc(db, 'wallets', user.uid) : null, [user, db]);
  const { data: wallet, loading: walletLoading } = useDoc(walletRef);
  const walletBalance = wallet?.balance || 0;

  useEffect(() => {
    if (!userLoading && !user) {
      toast({ variant: 'destructive', title: 'Session Required', description: 'Please login to complete your order.' });
      router.push('/login');
    } else if (!userLoading && (!items || items.length === 0)) {
      router.push('/cart');
    }
  }, [user, userLoading, items, router, toast]);

  const handlePlaceOrder = async () => {
    if (!verificationData || !user || !items || items.length === 0) return;
    
    if (paymentMethod === 'wallet' && walletBalance < totalAmount) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Please recharge your wallet to proceed.' });
      return;
    }

    setSubmitting(true);
    const orderId = `AH-2026-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
    const orderRef = doc(db, 'orders', orderId);

    try {
      const baseOrderData = {
        orderId,
        userId: user.uid,
        items: items,
        totalAmount,
        playerInfo: { 
          playerId: verificationData.playerId, 
          serverId: verificationData.serverId,
          verifiedName: verificationData.verifiedName || 'AATMA_USER'
        },
        paymentMethod,
        createdAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
      };

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

        const orderData = { ...baseOrderData, status: 'pending' };

        // Atomic multi-write simulation (Non-blocking)
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
        const orderData = { ...baseOrderData, status: 'pending_payment' };

        // Standard requirement: Order must exist before gateway handoff
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

  if (userLoading || walletLoading || !user || !verificationData || !items || items.length === 0) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;
  }

  const firstItem = items?.[0] || { name: 'Item', quantity: 0, region: 'Global' };

  return (
    <div className="flex flex-col w-full p-4 space-y-10 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Checkout Protocol</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">SECURED TRANSACTION</p>
      </header>

      {/* Compact Order Summary Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 bg-green-500 rounded-full" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Order Summary</h3>
        </div>
        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <ShieldCheck size={100} />
          </div>
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest leading-none flex items-center gap-1.5">
                  <CheckCircle2 size={10} /> Verified Identity
                </span>
                <p className="text-xl font-black text-white uppercase tracking-tight">{verificationData?.verifiedName || 'AATMA_USER'}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-lg">
                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">VERIFIED</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-border">
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <User size={10} className="text-primary" /> Player ID
                </span>
                <p className="text-sm font-black text-white">{verificationData?.playerId || '-'}</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Smartphone size={10} className="text-primary" /> Server ID
                </span>
                <p className="text-sm font-black text-white">{verificationData?.serverId || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-border">
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Package size={10} className="text-primary" /> Product / Package
                </span>
                <p className="text-sm font-black text-white uppercase truncate">
                  {firstItem?.name || 'Digital Item'} <span className="text-primary">x{firstItem?.quantity || 0}</span>
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Zap size={10} className="text-primary" /> Region
                </span>
                <p className="text-sm font-black text-white uppercase">{firstItem?.region || 'Global'}</p>
              </div>
            </div>

            <div className="pt-8 border-t border-border flex justify-between items-end">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none">Total Amount</span>
              <p className="text-4xl font-black text-primary tracking-tighter leading-none">₹{totalAmount}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3"><div className="h-6 w-1 bg-accent rounded-full" /><h3 className="text-xs font-black uppercase tracking-widest text-white/80">Select Payment Protocol</h3></div>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-3">
          <Label htmlFor="wallet" className={`flex items-center justify-between p-6 rounded-3xl border transition-all cursor-pointer bg-card shadow-xl ${paymentMethod === 'wallet' ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}>
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'wallet' ? 'bg-primary/20' : 'bg-white/5'}`}>
                <Wallet className={paymentMethod === 'wallet' ? 'text-primary' : 'text-muted-foreground'} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-tight">Hub Wallet</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${walletBalance < totalAmount ? 'text-primary' : 'text-green-500'}`}>₹{walletBalance.toLocaleString()} Available</span>
              </div>
            </div>
            <RadioGroupItem value="wallet" id="wallet" className="sr-only" />
            {paymentMethod === 'wallet' && <CheckCircle2 className="h-5 w-5 text-primary" />}
          </Label>
          
          <Label htmlFor="phonepe" className={`flex items-center justify-between p-6 rounded-3xl border transition-all cursor-pointer bg-card shadow-xl ${paymentMethod === 'phonepe' ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}>
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'phonepe' ? 'bg-primary/20' : 'bg-white/5'}`}>
                <Smartphone className={paymentMethod === 'phonepe' ? 'text-primary' : 'text-muted-foreground'} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-tight">PhonePe UPI</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">External Gateway</span>
              </div>
            </div>
            <RadioGroupItem value="phonepe" id="phonepe" className="sr-only" />
            {paymentMethod === 'phonepe' && <CheckCircle2 className="h-5 w-5 text-primary" />}
          </Label>
        </RadioGroup>
      </section>

      <div className="flex flex-col gap-4 pt-4">
        <Button 
          className="w-full h-16 bg-primary hover:bg-secondary text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 rounded-2xl group transition-all"
          onClick={handlePlaceOrder} 
          disabled={submitting || !verificationData?.isVerified}
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Confirm & Pay <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></>}
        </Button>
        <Button variant="ghost" onClick={() => router.push('/cart')} className="w-full h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white"><ArrowLeft className="mr-2 h-4 w-4" /> Modify Hub Items</Button>
      </div>

      <div className="flex items-center justify-center gap-3 py-6 opacity-30">
        <ShieldCheck className="h-4 w-4" />
        <span className="text-[8px] font-black uppercase tracking-[0.4em]">Hub-to-Server Secured Encryption</span>
      </div>
    </div>
  );
}
