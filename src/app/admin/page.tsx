
'use client';

import { useMemo, useState, useEffect, memo } from 'react';
import dynamic from 'next/dynamic';
import { useFirestore } from '@/firebase/provider';
import { collection, doc, getDoc, query, where, limit, orderBy } from 'firebase/firestore';
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
  Bot,
  BarChart3,
  ShieldCheck,
  Globe,
  Database,
  Activity,
  ChevronRight,
  Tv,
  Share2,
  Home as HomeIcon,
  Layers,
  Trophy,
  Gamepad2
} from 'lucide-react';
import Link from 'next/link';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic Import for heavy chart module
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
                <div className="bg-black border border-border p-2 rounded-lg shadow-2xl">
                  <p className="text-[8px] font-black uppercase text-primary">{payload[0].payload.name}</p>
                  <p className="text-sm font-black tracking-tighter text-white">₹{payload[0].value}</p>
                </div>
              );
            }
            return null;
          }} />
          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };
}), { 
  ssr: false, 
  loading: () => <Skeleton className="w-full h-full bg-white/5 rounded-xl" /> 
});

export default function AdminDashboard() {
  const db = useFirestore();
  const { profile } = useUser();
  const [tgStatus, setTgStatus] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  const isSuper = profile?.role === 'super_admin';

  // OPTIMIZATION: Temporal Capping to reduce initial data payload
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
    getDoc(doc(db, 'settings', 'telegram')).then(snap => {
      if (snap.exists()) setTgStatus(snap.data());
    });
  }, [db]);

  const stats = useMemo(() => {
    if (!isMounted) return [];
    const totalRevenue = orders?.reduce((acc, order) => order.status === 'completed' ? acc + (order.totalAmount || 0) : acc, 0) || 0;
    const totalDeposits = transactions?.filter(t => t.type === 'deposit' && t.status === 'success').reduce((acc, t) => acc + (t.amount || 0), 0) || 0;

    return [
      { label: 'Revenue (30d)', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-primary' },
      { label: 'Active Users', value: users?.length || 0, icon: Users, color: 'text-accent' },
      { label: 'Recent Orders', value: orders?.length || 0, icon: ShoppingCart, color: 'text-white' },
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
    { label: 'Game Management', href: '/admin/games', icon: Gamepad2, desc: 'Manage hub titles & services' },
    { label: 'Rank Management', href: '/admin/ranks', icon: Trophy, desc: 'Manage tiers & requirements' },
    { label: 'Product Management', href: '/admin/products', icon: Package, desc: 'Manage products & pricing' },
    { label: 'User Management', href: '/admin/users', icon: Users, desc: 'Manage users, roles & access' },
    { label: 'Region Management', href: '/admin/regions', icon: Globe, desc: 'Manage regions & availability' },
    { label: 'Tab Management', href: '/admin/tabs', icon: Layers, desc: 'Manage catalog tabs' },
    { label: 'Home Control', href: '/admin/homepage', icon: HomeIcon, desc: 'Manage homepage sections' },
    { label: 'Payment Settings', href: '/admin/settings/payments', icon: IndianRupee, desc: 'Manage payment gateways' },
    { label: 'System Settings', href: '/admin/system', icon: Activity, desc: 'Website & system configuration' },
    { label: 'Backup Management', href: '/admin/backups', icon: Database, desc: 'Database backups & restore' },
  ], []);

  if (!isMounted) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      <header className="flex justify-between items-end px-1">
        <div>
          <h1 className="text-2xl font-headline font-black tracking-tighter uppercase">Intelligence</h1>
          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">System Core v2.5</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/analytics">
             <div className="p-2 border border-border rounded-xl flex items-center bg-white/5 hover:border-primary transition-all">
                <BarChart3 className="h-4 w-4 text-primary" />
             </div>
          </Link>
          <Link href="/admin/settings/telegram">
            <div className={`p-2 border border-border rounded-xl flex items-center transition-colors cursor-pointer ${tgStatus?.notificationsEnabled ? 'bg-primary/5 border-primary/30' : 'bg-black/20 opacity-50'}`}>
              <Bot className={`h-4 w-4 ${tgStatus?.notificationsEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
          </Link>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-4 gap-1 px-1">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {isSuper && (
        <section className="space-y-3">
           <div className="flex items-center gap-2 px-1">
              <ShieldCheck className="h-3 w-3 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Super Admin Command Center</h2>
           </div>
           <div className="flex flex-col gap-2">
              {superModules.map((mod, i) => (
                <ModuleCard key={i} {...mod} />
              ))}
           </div>
        </section>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border rounded-3xl overflow-hidden shadow-2xl p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest">Business Analytics</h3>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Sales Perf (7D)</span>
            </div>
          </div>
          <div className="h-[110px] w-full">
            <BarChartComponent data={chartData} />
          </div>
        </Card>

        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl p-5 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest">Pipeline</h3>
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
    <Card className="h-[64px] bg-card border-border shadow-xl rounded-xl overflow-hidden group hover:border-primary/30 transition-all">
      <CardContent className="p-1.5 flex flex-col justify-center gap-1 h-full">
        <div className={`h-6 w-6 shrink-0 rounded-md bg-white/5 flex items-center justify-center ${color}`}>
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
    <Link href={href}>
      <Card className="bg-card border-border h-[72px] rounded-2xl hover:border-primary/40 transition-all group flex items-center px-4 shadow-xl">
        <div className="flex items-center gap-4 w-full">
          <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
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
    <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center bg-black/40 ${color}`}>
          <Icon size={14} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-lg font-black leading-none">{count}</span>
    </div>
  );
});
