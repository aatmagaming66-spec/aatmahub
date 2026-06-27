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
import { FirestorePermissionError } from '@/firebase/errors';
import { 
  ShieldCheck, 
  Wallet, 
  Smartphone, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  User,
  Receipt
} from 'lucide-react';
import { sendTelegramNotification } from '@/lib/telegram';
import { Skeleton } from '@/components/ui/skeleton';

export default function CheckoutPage() {
  const { items, totalAmount } = useCart();
  const { user, profile, loading: userLoading, initialized } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();

  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialized && (!items || items.length === 0)) {
      router.push('/cart');
    }
  }, [items, initialized, router]);

  const walletRef = useMemo(() => user ? doc(db, 'wallets', user.uid) : null, [user, db]);
  const { data: wallet, loading: walletLoading } = useDoc(walletRef);
  const walletBalance = wallet?.balance ?? 0;

  useEffect(() => {
    if (initialized && !user) {
      toast({ variant: 'destructive', title: 'Login Required', description: 'Please login to finish your purchase.' });
      router.push('/login');
    }
  }, [user, initialized, router, toast]);

  const grandTotal = totalAmount;

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
          playerId: item.playerId || 'N/A',
          serverId: item.serverId || 'N/A',
          verifiedName: item.verifiedName || 'User',
          items: [],
          total: 0
        };
      }
      groups[key].items.push(item);
      groups[key].total += (item.price * item.quantity);
    });

    return Object.values(groups);
  }, [items]);

  const payableAmount = useMemo(() => {
    if (paymentMethod === 'wallet') {
      return Math.max(0, grandTotal - walletBalance);
    }
    return grandTotal;
  }, [paymentMethod, grandTotal, walletBalance]);

  const handlePlaceOrder = async () => {
    if (groupedIdentities.length === 0 || !user || !items || items.length === 0) return;
    
    if (paymentMethod === 'wallet' && walletBalance < grandTotal) {
      toast({ variant: 'destructive', title: 'Insufficient Balance', description: 'Please add funds to your wallet to continue.' });
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
        discountAmount: 0,
        grandTotal,
        totalAccounts: groupedIdentities.length,
        totalProducts: items.length,
        walletUsed: paymentMethod === 'wallet' ? Math.min(grandTotal, walletBalance) : 0,
        payableAmount,
        playerInfo: { 
          playerId: primaryIdentity.playerId, 
          serverId: primaryIdentity.serverId,
          verifiedName: primaryIdentity.verifiedName,
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
        const userDocRef = doc(db, 'users', user.uid);

        const txData = {
          transactionId: txId,
          userId: user.uid,
          amount: grandTotal,
          type: 'purchase',
          status: 'success',
          createdAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp(),
        };

        updateDoc(walletDocRef, { balance: increment(-grandTotal), updatedAt: new Date().toISOString() })
          .catch(async (e) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: walletDocRef.path, operation: 'update', requestResourceData: { balance: `decrement(${grandTotal})` } })));

        setDoc(txRef, txData)
          .catch(async (e) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: txRef.path, operation: 'create', requestResourceData: txData })));

        await setDoc(orderRef, { ...baseOrderData, status: 'pending' });
        
        const currentSpend = profile?.lifetimeSpend || 0;
        const newSpend = currentSpend + grandTotal;
        
        updateDoc(userDocRef, {
          lifetimeSpend: newSpend,
          updatedAt: new Date().toISOString()
        }).catch(err => console.error("Update fail", err));

        sendTelegramNotification(db, `📦 <b>NEW ORDER</b>\n\nID: ${orderId}\nUser: ${profile?.fullName || user.email}\nAmount: ₹${grandTotal}`);
        router.push(`/checkout/success/${orderId}`);
      } else if (paymentMethod === 'phonepe') {
        await setDoc(orderRef, { ...baseOrderData, status: 'pending_payment' });

        const res = await fetch('/api/payments/phonepe/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: grandTotal, transactionId: orderId, userId: user.uid, type: 'order', orderId }),
        });

        const data = await res.json();
        if (data.success && data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          throw new Error(data.error || 'Payment gateway error.');
        }
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Order Error', description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-4 space-y-6 animate-in fade-in duration-700">
      <header className="py-2">
        <h1 className="text-2xl font-headline font-black tracking-tighter uppercase">Review Order</h1>
        <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Finalize digital asset delivery</p>
      </header>

      <Card className="bg-card border-border rounded-none overflow-hidden shadow-2xl relative">
        <CardContent className="p-0">
          <div className="p-3 border-b border-border bg-black/20">
            <div className="flex items-center gap-2 mb-2 px-1">
               <ShieldCheck className="h-2.5 w-2.5 text-green-500" />
               <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Verified Delivery Target</span>
            </div>
            
            {!initialized && items?.length > 0 ? <Skeleton className="h-20 w-full bg-white/5" /> : (
              <Accordion type="single" collapsible className="space-y-1.5">
                {groupedIdentities.map((group, idx) => (
                  <AccordionItem 
                    key={idx} 
                    value={`account-${idx}`}
                    className="border border-white/5 rounded-none overflow-hidden bg-white/5"
                  >
                    <AccordionTrigger className="px-3 py-2 hover:no-underline group text-left">
                      <div className="flex items-center justify-between w-full pr-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 bg-primary/10 flex items-center justify-center">
                            <User size={12} className="text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="text-[9px] font-black uppercase text-white truncate max-w-[100px]">{group.verifiedName}</p>
                            <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-tighter">ID: {group.playerId}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-primary">₹{group.total}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        {group.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-black/40 p-1.5">
                            <span className="text-[7px] font-bold text-white/70 uppercase truncate max-w-[140px]">{item.name}</span>
                            <span className="text-[7px] font-black text-primary">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          <div className="p-5 space-y-2">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              <span>Order Subtotal</span>
              <span className="text-white">₹{totalAmount}</span>
            </div>

            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              <span>Wallet Balance</span>
              <span className={walletBalance < grandTotal && paymentMethod === 'wallet' ? 'text-primary' : 'text-white'}>
                ₹{walletBalance.toLocaleString()}
              </span>
            </div>
            
            <div className="pt-3 border-t border-border flex justify-between items-end">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Total Payable</span>
                <p className="text-3xl font-black text-white tracking-tighter leading-none">₹{payableAmount}</p>
              </div>
              <div className="bg-primary/10 border border-primary/20 px-2.5 py-1.5">
                 <Receipt size={14} className="text-primary" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/80">Select Payment Method</h3>
        </div>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-2.5">
          <Label htmlFor="wallet" className={`flex flex-col items-center justify-center gap-2 p-3 rounded-none border transition-all cursor-pointer bg-card min-h-[85px] ${paymentMethod === 'wallet' ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}>
            <div className={`h-8 w-8 flex items-center justify-center ${paymentMethod === 'wallet' ? 'bg-primary/20' : 'bg-white/5'}`}>
              <Wallet size={14} className={paymentMethod === 'wallet' ? 'text-primary' : 'text-muted-foreground'} />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase block leading-none mb-1">Hub Wallet</span>
              <span className={`text-[7px] font-bold uppercase ${walletBalance < grandTotal ? 'text-primary' : 'text-green-500'}`}>Balance: ₹{walletBalance.toLocaleString()}</span>
            </div>
            <RadioGroupItem value="wallet" id="wallet" className="sr-only" />
          </Label>
          
          <Label htmlFor="phonepe" className={`flex flex-col items-center justify-center gap-2 p-3 rounded-none border transition-all cursor-pointer bg-card min-h-[85px] ${paymentMethod === 'phonepe' ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}>
            <div className={`h-8 w-8 flex items-center justify-center ${paymentMethod === 'phonepe' ? 'bg-primary/20' : 'bg-white/5'}`}>
              <Smartphone size={14} className={paymentMethod === 'phonepe' ? 'text-primary' : 'text-muted-foreground'} />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase block leading-none mb-1">PhonePe UPI</span>
              <span className="text-[7px] font-bold text-muted-foreground uppercase">Instant Payment</span>
            </div>
            <RadioGroupItem value="phonepe" id="phonepe" className="sr-only" />
          </Label>
        </RadioGroup>
      </section>

      <div className="flex flex-col gap-3 pt-1">
        <Button 
          className="w-full h-14 bg-primary hover:bg-secondary text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 rounded-none group transition-all"
          onClick={handlePlaceOrder} 
          disabled={submitting || groupedIdentities.length === 0}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Complete Purchase <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
        </Button>
        <Button variant="ghost" onClick={() => router.push('/cart')} className="w-full h-10 text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-white rounded-none"><ArrowLeft className="mr-2 h-2.5 w-2.5" /> Back to Cart</Button>
      </div>
    </div>
  );
}