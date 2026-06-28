
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
  ArrowRight, 
  ArrowLeft,
  Loader2,
  User,
  Receipt,
  MessageCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, totalAmount } = useCart();
  const { user, profile, initialized } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();

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

  const hasInsufficientBalance = walletBalance < grandTotal;

  const handlePlaceOrder = async () => {
    if (groupedIdentities.length === 0 || !user || !items || items.length === 0) return;
    
    if (hasInsufficientBalance) {
      toast({ variant: 'destructive', title: 'Insufficient Balance', description: 'Please recharge your wallet to continue.' });
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
        walletUsed: grandTotal,
        payableAmount: 0,
        playerInfo: { 
          playerId: primaryIdentity.playerId, 
          serverId: primaryIdentity.serverId,
          verifiedName: primaryIdentity.verifiedName,
        },
        paymentMethod: 'wallet',
        status: 'pending',
        createdAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
        updatedAt: new Date().toISOString()
      };

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

      await updateDoc(walletDocRef, { 
        balance: increment(-grandTotal), 
        updatedAt: new Date().toISOString() 
      }).catch(async (e) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: walletDocRef.path, operation: 'update', requestResourceData: { balance: `decrement(${grandTotal})` } })));

      await setDoc(txRef, txData)
        .catch(async (e) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: txRef.path, operation: 'create', requestResourceData: txData })));

      await setDoc(orderRef, baseOrderData);
      
      const currentSpend = profile?.lifetimeSpend || 0;
      await updateDoc(userDocRef, {
        lifetimeSpend: currentSpend + grandTotal,
        updatedAt: new Date().toISOString()
      }).catch(err => console.error("Update fail", err));

      router.push(`/checkout/success/${orderId}`);
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
              <span className={hasInsufficientBalance ? 'text-primary' : 'text-white'}>
                ₹{walletBalance.toLocaleString()}
              </span>
            </div>
            
            <div className="pt-3 border-t border-border flex justify-between items-end">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Payable via Wallet</span>
                <p className="text-3xl font-black text-white tracking-tighter leading-none">₹{grandTotal}</p>
              </div>
              <div className="bg-primary/10 border border-primary/20 px-2.5 py-1.5">
                 <Receipt size={14} className="text-primary" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasInsufficientBalance && (
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-none space-y-3 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 text-primary">
            <Wallet size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Balance Required</span>
          </div>
          <p className="text-[10px] text-white/70 font-bold uppercase leading-relaxed">
            You need <span className="text-primary">₹{(grandTotal - walletBalance).toLocaleString()}</span> more to complete this purchase.
          </p>
          <Link href="/wallet/deposit">
            <Button className="w-full bg-primary h-10 text-[9px] font-black uppercase tracking-widest rounded-none mt-2">
              Request Manual Recharge
            </Button>
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-1">
        <Button 
          className="w-full h-14 bg-primary hover:bg-secondary text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 rounded-none group transition-all"
          onClick={handlePlaceOrder} 
          disabled={submitting || hasInsufficientBalance || groupedIdentities.length === 0}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Complete with Wallet <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
        </Button>
        <Button variant="ghost" onClick={() => router.push('/cart')} className="w-full h-10 text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-white rounded-none"><ArrowLeft className="mr-2 h-2.5 w-2.5" /> Back to Cart</Button>
      </div>
    </div>
  );
}
