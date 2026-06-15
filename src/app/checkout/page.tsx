
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, type CartItem } from '@/context/cart-context';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { doc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
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
  Layers
} from 'lucide-react';
import { sendTelegramNotification } from '@/lib/telegram';

export default function CheckoutPage() {
  const { items, totalAmount } = useCart();
  const { user, profile, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();

  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [submitting, setSubmitting] = useState(false);

  // REDIRECT GATING: Redirect to cart if empty
  useEffect(() => {
    if (!userLoading && (!items || items.length === 0)) {
      router.push('/cart');
    }
  }, [items, userLoading, router]);

  const walletRef = useMemo(() => user ? doc(db, 'wallets', user.uid) : null, [user, db]);
  const { data: wallet, loading: walletLoading } = useDoc(walletRef);
  const walletBalance = wallet?.balance ?? 0;

  useEffect(() => {
    if (!userLoading && !user) {
      toast({ variant: 'destructive', title: 'Session Required', description: 'Please login to complete your order.' });
      router.push('/login');
    }
  }, [user, userLoading, router, toast]);

  // IDENTITY GROUPING LOGIC
  // Instead of one identity, we group all items by their verified identity snapshot
  const groupedIdentities = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    const groups: Record<string, {
      playerId: string;
      serverId: string;
      verifiedName: string;
      items: CartItem[];
      total: number;
    }> = {};

    items.forEach(item => {
      const key = `${item.playerId}_${item.serverId}`;
      if (!groups[key]) {
        groups[key] = {
          playerId: item.playerId || 'UNKNOWN',
          serverId: item.serverId || 'UNKNOWN',
          verifiedName: item.verifiedName || 'AATMA_USER',
          items: [],
          total: 0
        };
      }
      groups[key].items.push(item);
      groups[key].total += (item.price * item.quantity);
    });

    return Object.values(groups);
  }, [items]);

  const handlePlaceOrder = async () => {
    if (groupedIdentities.length === 0 || !user || !items || items.length === 0) return;
    
    if (paymentMethod === 'wallet' && walletBalance < totalAmount) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Please recharge your wallet to proceed.' });
      return;
    }

    setSubmitting(true);
    const orderId = `AH-2026-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
    const orderRef = doc(db, 'orders', orderId);

    console.log(`[Wallet Audit] Multi-Identity Purchase Initiated: orderId=${orderId}, user=${user.uid}, total=₹${totalAmount}`);

    try {
      // Use the first identity group for the top-level playerInfo record
      const primaryIdentity = groupedIdentities[0];

      const baseOrderData = {
        orderId,
        userId: user.uid,
        items: items, // Contains per-item identity snapshots
        totalAmount,
        playerInfo: { 
          playerId: primaryIdentity.playerId, 
          serverId: primaryIdentity.serverId,
          verifiedName: primaryIdentity.verifiedName,
          multiTarget: groupedIdentities.length > 1
        },
        paymentMethod,
        createdAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
        updatedAt: new Date().toISOString()
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

        const orderData = { ...baseOrderData, status: 'pending' };

        // Atomic mutations
        updateDoc(walletDocRef, {
          balance: increment(-totalAmount),
          updatedAt: new Date().toISOString()
        }).catch(async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: walletDocRef.path, operation: 'update', requestResourceData: { balance: `increment(${-totalAmount})` }
          } satisfies SecurityRuleContext));
        });

        setDoc(txRef, txData).catch(async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: txRef.path, operation: 'create', requestResourceData: txData
          } satisfies SecurityRuleContext));
        });

        await setDoc(orderRef, orderData).catch(async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: orderRef.path, operation: 'create', requestResourceData: orderData
          } satisfies SecurityRuleContext));
        });
        
        sendTelegramNotification(db, `🚀 <b>NEW MULTI-ORDER (WALLET)</b>\n\n📦 ID: ${orderId}\n👤 User: ${profile?.fullName || user.email}\n🎯 Targets: ${groupedIdentities.length}\n💰 Total: ₹${totalAmount}`);
        
        router.push(`/checkout/success/${orderId}`);
      } else if (paymentMethod === 'phonepe') {
        const orderData = { ...baseOrderData, status: 'pending_payment' };

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
        const data = text ? JSON.parse(text) : {};

        if (data.success && data.paymentUrl) {
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

  if (userLoading || walletLoading || !user || !items || items.length === 0) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col w-full p-4 space-y-10 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Checkout Protocol</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">SECURED MULTI-TRANSACTION</p>
      </header>

      {/* Grouped Identity Summaries */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 bg-green-500 rounded-full" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Identity Snapshots</h3>
          </div>
          {groupedIdentities.length > 1 && (
             <span className="text-[9px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">
               {groupedIdentities.length} Targets Detected
             </span>
          )}
        </div>

        <div className="space-y-6">
          {groupedIdentities.map((group, idx) => (
            <Card key={`${group.playerId}_${idx}`} className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Layers size={80} />
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest leading-none flex items-center gap-1.5">
                      <CheckCircle2 size={10} /> Profile Snapshot {idx + 1}
                    </span>
                    <p className="text-xl font-black text-white uppercase tracking-tight">{group.verifiedName}</p>
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
                    <p className="text-sm font-black text-white">{group.playerId}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Zap size={10} className="text-primary" /> Server ID
                    </span>
                    <p className="text-sm font-black text-white">{group.serverId}</p>
                  </div>
                </div>

                {/* Items in this group */}
                <div className="pt-6 space-y-3">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Group Allocation</span>
                  {group.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <Package size={12} className="text-primary" />
                        <span className="text-[10px] font-bold text-white uppercase truncate max-w-[150px]">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-primary">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                   <span className="text-[9px] font-black uppercase text-muted-foreground">Group Total: <span className="text-white">₹{group.total}</span></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Global Total */}
        <div className="bg-primary/10 border border-primary/20 p-6 rounded-3xl flex justify-between items-end shadow-xl">
           <span className="text-sm font-black text-white uppercase tracking-[0.2em] leading-none">Order Grand Total</span>
           <p className="text-4xl font-black text-primary tracking-tighter leading-none">₹{totalAmount}</p>
        </div>
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
          disabled={submitting || groupedIdentities.length === 0}
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
