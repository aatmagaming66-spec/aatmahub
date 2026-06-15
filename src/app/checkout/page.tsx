
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
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
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
  Layers,
  Receipt,
  ChevronDown
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

  // REDIRECT GATING
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

  const totalAccounts = groupedIdentities.length;
  const totalProducts = items.length;
  
  const payableAmount = useMemo(() => {
    if (paymentMethod === 'wallet') {
      return Math.max(0, totalAmount - walletBalance);
    }
    return totalAmount;
  }, [paymentMethod, totalAmount, walletBalance]);

  const handlePlaceOrder = async () => {
    if (groupedIdentities.length === 0 || !user || !items || items.length === 0) return;
    
    if (paymentMethod === 'wallet' && walletBalance < totalAmount) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Please recharge your wallet to proceed.' });
      return;
    }

    setSubmitting(true);
    const orderId = `AH-2026-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
    const orderRef = doc(db, 'orders', orderId);

    try {
      const primaryIdentity = groupedIdentities[0];

      const baseOrderData = {
        orderId,
        userId: user.uid,
        items: items, 
        totalAmount,
        totalAccounts,
        totalProducts,
        grandTotal: totalAmount,
        walletUsed: paymentMethod === 'wallet' ? Math.min(totalAmount, walletBalance) : 0,
        payableAmount,
        groupedSnapshots: groupedIdentities.map(g => ({
          playerId: g.playerId,
          serverId: g.serverId,
          verifiedName: g.verifiedName,
          itemCount: g.items.length,
          subtotal: g.total
        })),
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

        updateDoc(walletDocRef, { balance: increment(-totalAmount), updatedAt: new Date().toISOString() })
          .catch(async (e) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: walletDocRef.path, operation: 'update', requestResourceData: { balance: `increment(${-totalAmount})` } })));

        setDoc(txRef, txData)
          .catch(async (e) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: txRef.path, operation: 'create', requestResourceData: txData })));

        await setDoc(orderRef, { ...baseOrderData, status: 'pending' })
          .catch(async (e) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: orderRef.path, operation: 'create', requestResourceData: baseOrderData })));
        
        sendTelegramNotification(db, `🚀 <b>NEW MULTI-ORDER (WALLET)</b>\n\n📦 ID: ${orderId}\n👤 User: ${profile?.fullName || user.email}\n🎯 Targets: ${groupedIdentities.length}\n💰 Total: ₹${totalAmount}`);
        router.push(`/checkout/success/${orderId}`);
      } else if (paymentMethod === 'phonepe') {
        await setDoc(orderRef, { ...baseOrderData, status: 'pending_payment' });

        const res = await fetch('/api/payments/phonepe/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalAmount, transactionId: orderId, userId: user.uid, type: 'order', orderId }),
        });

        const data = await res.json();
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
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="py-4">
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Checkout Hub</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">MASTER TRANSACTION PROTOCOL</p>
      </header>

      {/* COMPACT UNIFIED SUMMARY CARD */}
      <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none -rotate-12">
          <Layers size={140} />
        </div>
        
        <CardContent className="p-0">
          {/* Header Stats */}
          <div className="grid grid-cols-2 border-b border-border">
            <div className="p-6 border-r border-border text-center space-y-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total Accounts</span>
              <p className="text-2xl font-black text-white">{totalAccounts}</p>
            </div>
            <div className="p-6 text-center space-y-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total Items</span>
              <p className="text-2xl font-black text-white">{totalProducts}</p>
            </div>
          </div>

          {/* Collapsible Identity Snapshots */}
          <div className="p-4 border-b border-border bg-black/20">
            <div className="flex items-center gap-2 mb-3 px-2">
               <ShieldCheck className="h-3 w-3 text-green-500" />
               <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Verified Targets</span>
            </div>
            
            <Accordion type="single" collapsible className="space-y-2">
              {groupedIdentities.map((group, idx) => (
                <AccordionItem 
                  key={idx} 
                  value={`account-${idx}`}
                  className="border border-white/5 rounded-2xl overflow-hidden bg-white/5"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline group">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                          <User size={14} className="text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase text-white truncate max-w-[120px]">{group.verifiedName}</p>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">ID: {group.playerId}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-primary">₹{group.total}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1">
                    <div className="space-y-3 pt-3 border-t border-white/5">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase">
                        <span className="text-muted-foreground">Server ID:</span>
                        <span className="text-white">{group.serverId}</span>
                      </div>
                      <div className="space-y-2">
                        {group.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-black/40 p-2 rounded-lg">
                            <span className="text-[8px] font-bold text-white/70 uppercase truncate max-w-[150px]">{item.name}</span>
                            <span className="text-[8px] font-black text-primary">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Financial Summary Footer */}
          <div className="p-8 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <span>Grand Total</span>
              <span className="text-white">₹{totalAmount}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <span>Wallet Balance</span>
              <span className={walletBalance < totalAmount && paymentMethod === 'wallet' ? 'text-primary' : 'text-green-500'}>
                ₹{walletBalance.toLocaleString()}
              </span>
            </div>
            
            <div className="pt-6 border-t border-border flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Payable Amount</span>
                <p className="text-4xl font-black text-white tracking-tighter leading-none">₹{payableAmount}</p>
              </div>
              <div className="bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl">
                 <Receipt size={16} className="text-primary" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Selection */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="h-6 w-1 bg-accent rounded-full" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Select Gateway</h3>
        </div>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-3">
          <Label htmlFor="wallet" className={`flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer bg-card ${paymentMethod === 'wallet' ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}>
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${paymentMethod === 'wallet' ? 'bg-primary/20' : 'bg-white/5'}`}>
                <Wallet size={18} className={paymentMethod === 'wallet' ? 'text-primary' : 'text-muted-foreground'} />
              </div>
              <div>
                <span className="text-xs font-black uppercase block leading-none mb-1">Hub Wallet</span>
                <span className={`text-[8px] font-bold uppercase ${walletBalance < totalAmount ? 'text-primary' : 'text-green-500'}`}>₹{walletBalance.toLocaleString()} Available</span>
              </div>
            </div>
            <RadioGroupItem value="wallet" id="wallet" className="sr-only" />
            {paymentMethod === 'wallet' && <CheckCircle2 className="h-4 w-4 text-primary" />}
          </Label>
          
          <Label htmlFor="phonepe" className={`flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer bg-card ${paymentMethod === 'phonepe' ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}>
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${paymentMethod === 'phonepe' ? 'bg-primary/20' : 'bg-white/5'}`}>
                <Smartphone size={18} className={paymentMethod === 'phonepe' ? 'text-primary' : 'text-muted-foreground'} />
              </div>
              <div>
                <span className="text-xs font-black uppercase block leading-none mb-1">PhonePe UPI</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase">Instant Activation</span>
              </div>
            </div>
            <RadioGroupItem value="phonepe" id="phonepe" className="sr-only" />
            {paymentMethod === 'phonepe' && <CheckCircle2 className="h-4 w-4 text-primary" />}
          </Label>
        </RadioGroup>
      </section>

      {/* Action Area */}
      <div className="flex flex-col gap-4 pt-2">
        <Button 
          className="w-full h-16 bg-primary hover:bg-secondary text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 rounded-2xl group transition-all"
          onClick={handlePlaceOrder} 
          disabled={submitting || totalAccounts === 0}
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Execute Order <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></>}
        </Button>
        <Button variant="ghost" onClick={() => router.push('/cart')} className="w-full h-12 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-white"><ArrowLeft className="mr-2 h-3 w-3" /> Return to Cart</Button>
      </div>

      <div className="flex items-center justify-center gap-3 py-6 opacity-20">
        <ShieldCheck className="h-4 w-4" />
        <span className="text-[7px] font-black uppercase tracking-[0.4em]">Hub-to-Server 256-bit AES Encryption</span>
      </div>
    </div>
  );
}
