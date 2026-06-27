'use client';

import { useMemo, useState, useEffect, memo } from 'react';
import dynamic from 'next/dynamic';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, limit } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  ShoppingCart, 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Package,
  BarChart3,
  ShieldCheck,
  Database,
  ChevronRight,
  Home as HomeIcon,
  Gamepad2,
  Settings,
  Image as ImageIcon,
  Zap,
  CreditCard,
  Ticket
} from 'lucide-react';
import Link from 'next/link';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const BarChartComponent = dynamic(() => import('recharts').then(mod => {
  const { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } = mod;
  return function RechartsWrapper({ data }: { data: any[] }) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#444" fontSize={8} tickLine={false} axisLine={false} />
          <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-black border border-border p-2 rounded-none shadow-2xl">
                  <p className="text-[8px] font-black uppercase text-primary">{payload[0].payload.name}</p>
                  <p className="text-sm font-black tracking-tighter text-white">₹{payload[0].value}</p>
                </div>
              );
            }
            return null;
          }} />
          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };
}), { 
  ssr: false, 
  loading: () => <Skeleton className="w-full h-full bg-white/5 rounded-none" /> 
});

export default function AdminDashboard() {
  const db = useFirestore();
  const { profile } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  const isSuper = profile?.role === 'admin' || profile?.role === 'super_admin';

  const thirtyDaysAgo = useMemo(() => subDays(new Date(), 30).toISOString(), []);

  const usersRef = useMemo(() => query(collection(db, 'users'), limit(100)), [db]);
  const ordersRef = useMemo(() => query(
    collection(db, 'orders'), 
    where('createdAt', '>=', thirtyDaysAgo)
  ), [db, thirtyDaysAgo]);
  
  const transactionsRef = useMemo(() => query(
    collection(db, 'transactions'), 
    where('createdAt', '>=', thirtyDaysAgo),
    limit(500)
  ), [db, thirtyDaysAgo]);

  const { data: users } = useCollection(usersRef);
  const { data: orders } = useCollection(ordersRef);
  const { data: transactions } = useCollection(transactionsRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const stats = useMemo(() => {
    if (!isMounted) return [];
    const totalRevenue = orders?.reduce((acc, order) => order.status === 'completed' ? acc + (order.totalAmount || 0) : acc, 0) || 0;
    const totalDeposits = transactions?.filter(t => t.type === 'deposit' && t.status === 'success').reduce((acc, t) => acc + (t.amount || 0), 0) || 0;

    return [
      { label: 'Revenue (30d)', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-primary' },
      { label: 'Total Users', value: users?.length || 0, icon: Users, color: 'text-accent' },
      { label: 'Total Orders', value: orders?.length || 0, icon: ShoppingCart, color: 'text-white' },
      { label: 'Deposits (30d)', value: `₹${totalDeposits.toLocaleString()}`, icon: TrendingUp, color: 'text-green-400' },
    ];
  }, [users, orders, transactions, isMounted]);

  const chartData = useMemo(() => {
    if (!orders || !isMounted) return [];
    const now = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(now, 6 - i);
      const dayStr = format(d, 'EEE');
      const dayStart = startOfDay(d);
      const dayEnd = endOfDay(d);
      const revenue = orders
        .filter(o => o.status === 'completed' && isWithinInterval(new Date(o.createdAt), { start: dayStart, end: dayEnd }))
        .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
      return { name: dayStr, revenue };
    });
  }, [orders, isMounted]);

  const superModules = useMemo(() => [
    { label: 'Banner Management', href: '/admin/banners', icon: ImageIcon, desc: 'Manage sliders and promo graphics' },
    { label: 'Game Management', href: '/admin/games', icon: Gamepad2, desc: 'Add or organize supported games' },
    { label: 'Products & Pricing', href: '/admin/products', icon: Ticket, desc: 'SKU management and denomination pricing' },
    { label: 'User Management', href: '/admin/users', icon: Users, desc: 'Customer accounts and verification' },
    { label: 'Payment Gateway', href: '/admin/settings/payments', icon: CreditCard, desc: 'Payment provider and webhook config' },
    { label: 'Automation Hub', href: '/admin/settings/smileone', icon: Zap, desc: 'Smile.one API fulfillment settings' },
    { label: 'Website Settings', href: '/admin/homepage', icon: HomeIcon, desc: 'Branding, themes, and layout editor' },
    { label: 'System Settings', icon: Settings, href: '/admin/system', desc: 'Maintenance mode and global params' },
    { label: 'Backup & Logs', href: '/admin/backups', icon: Database, desc: 'Export system history and data' },
  ], []);

  if (!isMounted) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      <header className="flex justify-between items-end px-1">
        <div>
          <h1 className="text-2xl font-headline font-black tracking-tighter uppercase">Super Admin Hub</h1>
          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Enterprise Store Control</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/analytics" prefetch={false}>
             <div className="p-2 border border-border rounded-none flex items-center bg-white/5 hover:border-primary transition-all active-press">
                <BarChart3 className="h-4 w-4 text-primary" />
             </div>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-1 px-1">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {isSuper && (
        <section className="space-y-3">
           <div className="flex items-center gap-2 px-1">
              <ShieldCheck className="h-3 w-3 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Management Matrix</h2>
           </div>
           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {superModules.map((mod, i) => (
                <ModuleCard key={i} {...mod} />
              ))}
           </div>
        </section>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border rounded-none overflow-hidden shadow-2xl p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest">Revenue Velocity</h3>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-none bg-primary" />
              <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Last 7 Cycles</span>
            </div>
          </div>
          <div className="h-[110px] w-full">
            <BarChartComponent data={chartData} />
          </div>
        </Card>

        <Card className="bg-card border-border rounded-none overflow-hidden shadow-2xl p-5 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest">Order Lifecycle</h3>
          <div className="space-y-2">
            <PipelineItem label="Pending" count={orders?.filter(o => o.status === 'pending').length || 0} icon={Clock} color="text-orange-400" />
            <PipelineItem label="Processing" count={orders?.filter(o => o.status === 'processing').length || 0} icon={TrendingUp} color="text-accent" />
            <PipelineItem label="Completed" count={orders?.filter(o => o.status === 'completed').length || 0} icon={CheckCircle2} color="text-green-400" />
          </div>
        </Card>
      </div>
    </div>
  );
}

const StatCard = memo(function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <Card className="h-[64px] bg-card border-border shadow-xl rounded-none overflow-hidden group hover:border-primary/30 transition-all active-press">
      <CardContent className="p-1.5 flex flex-col justify-center gap-1 h-full">
        <div className={`h-6 w-6 shrink-0 rounded-none bg-white/5 flex items-center justify-center ${color}`}>
          <Icon size={11} />
        </div>
        <div className="min-w-0">
          <h3 className="text-[10px] sm:text-xs font-black tracking-tighter leading-none truncate">{value}</h3>
          <p className="text-[6px] font-black text-muted-foreground uppercase tracking-tight truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
});

const ModuleCard = memo(function ModuleCard({ label, href, icon: Icon, desc }: any) {
  return (
    <Link href={href} prefetch={false}>
      <Card className="bg-card border-border h-[72px] rounded-none hover:border-primary/40 transition-all group flex items-center px-4 shadow-xl active-press">
        <div className="flex items-center gap-4 w-full">
          <div className="h-10 w-10 flex-shrink-0 rounded-none bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <Icon size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-black uppercase tracking-tight leading-tight">{label}</h4>
            <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest leading-none mt-1">{desc}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
        </div>
      </Card>
    </Link>
  );
});

const PipelineItem = memo(function PipelineItem({ label, count, icon: Icon, color }: any) {
  return (
    <div className="bg-white/5 border border-white/5 p-3 rounded-none flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className={`h-7 w-7 rounded-none flex items-center justify-center bg-black/40 ${color}`}>
          <Icon size={14} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-lg font-black leading-none">{count}</span>
    </div>
  );
});
