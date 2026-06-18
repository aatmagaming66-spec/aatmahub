'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle2, 
  Package, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  Clock,
  Smartphone,
  Copy,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function fetchOrder() {
      if (!orderId) return;
      try {
        const docRef = doc(db, 'orders', orderId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId, db]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-accent';
      case 'pending': return 'text-orange-400';
      case 'cancelled':
      case 'failed': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const steps = [
    { title: 'Order Created', status: 'completed', icon: Clock },
    { title: 'Payment Verified', status: order?.status === 'pending' ? 'pending' : 'completed', icon: ShieldCheck },
    { title: 'Processing', status: order?.status === 'processing' ? 'active' : (order?.status === 'completed' ? 'completed' : 'pending'), icon: Zap },
    { title: 'Success', status: order?.status === 'completed' ? 'completed' : 'pending', icon: CheckCircle2 },
  ];

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="flex items-center gap-4 py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-none hover:bg-white/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-headline font-black tracking-tighter uppercase leading-none">Order Details</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Order ID • {orderId}</p>
        </div>
      </header>

      {!loading && !order ? (
        <div className="flex flex-col items-center justify-center h-[50vh] p-6 text-center">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4">Order Not Found</h2>
          <Button onClick={() => router.push('/orders')} className="bg-primary rounded-none">Return to Orders</Button>
        </div>
      ) : (
        <>
          <section className="px-2">
            <div className="relative flex justify-between items-start">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/5 z-0" />
              {steps.map((step, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center gap-2 group">
                  <div className={`h-10 w-10 rounded-none flex items-center justify-center border-2 transition-all duration-500 ${
                    step.status === 'completed' ? 'bg-green-500 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' :
                    step.status === 'active' ? 'bg-accent border-accent animate-pulse shadow-[0_0_15px_rgba(236,72,153,0.3)]' :
                    'bg-background border-white/10'
                  }`}>
                    <step.icon size={16} className={step.status === 'completed' || step.status === 'active' ? 'text-white' : 'text-white/20'} />
                  </div>
                  <span className={`text-[7px] font-black uppercase tracking-widest text-center max-w-[60px] ${
                    step.status === 'completed' ? 'text-green-500' :
                    step.status === 'active' ? 'text-accent' :
                    'text-white/20'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <Card className="bg-card border-border rounded-none overflow-hidden shadow-2xl">
            <CardContent className="p-8 space-y-8">
              {loading ? (
                <div className="space-y-6">
                  <Skeleton className="h-8 w-1/2" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Tag size={10} className="text-primary" /> Status
                      </span>
                      <p className={`text-xl font-black uppercase ${getStatusColor(order.status)}`}>{order.status}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total Amount</span>
                      <p className="text-3xl font-black text-primary tracking-tighter">₹{order.totalAmount}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Reference ID</span>
                      <div className="flex items-center gap-2 group cursor-pointer" onClick={() => copyToClipboard(order.orderId, 'Order ID')}>
                        <p className="text-xs font-black text-white uppercase">{order.orderId}</p>
                        <Copy size={10} className="text-white/20 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Order Date</span>
                      <p className="text-xs font-black text-white uppercase">
                        {isMounted ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '...'}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Payment Method</span>
                      <p className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                        <Smartphone size={10} className="text-primary" /> {order.paymentMethod}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Security</span>
                      <p className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                        <ShieldCheck size={10} className="text-green-500" /> Secure Payment
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4 pb-10">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/50 px-2">Items Purchased</h3>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 1 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : (
                order.items?.map((item: any, i: number) => (
                  <div key={i} className="bg-card border border-border p-5 rounded-none flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-none flex items-center justify-center border border-primary/10">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-tight">{item.name}</h4>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                          {item.region} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
