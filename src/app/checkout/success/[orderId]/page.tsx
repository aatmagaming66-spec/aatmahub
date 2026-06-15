
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Package, Calendar, Tag, ShieldCheck, ArrowRight, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const db = useFirestore();
  const router = useRouter();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function fetchOrder() {
      if (!orderId) return;
      const docRef = doc(db, 'orders', orderId as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const orderData = docSnap.data();
        setOrder(orderData);

        localStorage.removeItem('aatma_verification');
        clearCart();
        console.log(`[Wallet Audit] Protocol Fulfilled: Order ${orderId} confirmed. Identity and Cart purged.`);
      }
      setLoading(false);
    }
    fetchOrder();
  }, [orderId, db, clearCart]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-6 text-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Order Not Found</h2>
        <Button onClick={() => router.push('/')} className="bg-primary rounded-2xl">Return Home</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-6 space-y-10 animate-in zoom-in-95 duration-700">
      <div className="flex flex-col items-center text-center space-y-4 pt-10">
        <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-black tracking-tighter uppercase">Order Success</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Transaction processed successfully</p>
        </div>
      </div>

      <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 scale-150">
          <ShieldCheck size={140} />
        </div>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Tag size={10} className="text-primary" /> Order ID
              </span>
              <p className="text-sm font-black text-white uppercase">{order.orderId}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Calendar size={10} className="text-primary" /> Date
              </span>
              <p className="text-sm font-black text-white">
                {isMounted ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '...'}
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Package size={10} className="text-primary" /> Status
              </span>
              <p className="text-sm font-black text-green-400 uppercase">{order.status}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 size={10} className="text-primary" /> Payment
              </span>
              <p className="text-sm font-black text-white uppercase">{order.paymentMethod}</p>
            </div>
          </div>

          <div className="pt-8 border-t border-border">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Amount Paid</span>
                <p className="text-4xl font-black text-primary tracking-tighter">₹{order.totalAmount}</p>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Digital Asset Secured</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Link href="/orders" className="block">
          <Button className="w-full h-16 bg-primary hover:bg-secondary text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 group">
            View My Orders
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <Link href="/" className="block">
          <Button variant="outline" className="w-full h-14 border-border bg-transparent text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/5">
            Continue Shopping
          </Button>
        </Link>
      </div>

      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Distribution Notice</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
          Your digital item is being processed. In-game currency typically arrives within 2-5 minutes. Check your order details for real-time status updates.
        </p>
      </div>
    </div>
  );
}
