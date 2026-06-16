'use client';

import { useMemo, useState, useEffect } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, doc, getDoc } from 'firebase/firestore';
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
  Zap,
  BarChart3,
  ArrowUpRight,
  ShieldCheck,
  Globe,
  Database,
  Activity,
  ChevronRight
} from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import Link from 'next/link';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

export default function AdminDashboard() {
  const db = useFirestore();
  const { profile } = useUser();
  const [tgStatus, setTgStatus] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  const isSuper = profile?.role === 'super_admin';

  // Stabilize collection references
  const usersRef = useMemo(() => collection(db, 'users'), [db]);
  const ordersRef = useMemo(() => collection(db, 'orders'), [db]);
  const transactionsRef = useMemo(() => collection(db, 'transactions'), [db]);

  const { data: users } = useCollection(usersRef);
  const { data: orders } = useCollection(ordersRef);
  const { data: transactions } = useCollection(transactionsRef);

  useEffect(() => {
    setIsMounted(true);
    async function fetchTg() {
      const snap = await getDoc(doc(db, 'settings', 'telegram'));
      if (snap.exists()) setTgStatus(snap.data());
    }
    fetchTg();
  }, [db]);

  const stats = useMemo(() => {
    if (!isMounted) return [];
    const totalRevenue = orders?.reduce((acc, order) => order.status === 'completed' ? acc + order.totalAmount : acc, 0) || 0;
    const totalDeposits = transactions?.filter(t => t.type === 'deposit' && t.status === 'success').reduce((acc, t) => acc + t.amount, 0) || 0;

    return [
      { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-primary' },
      { label: 'Active Users', value: users?.length || 0, icon: Users, color: 'text-accent' },
      { label: 'Total Orders', value: orders?.length || 0, icon: ShoppingCart, color: 'text-white' },
      { label: 'Wallet Deposits', value: `₹${totalDeposits.toLocaleString()}`, icon: TrendingUp, color: 'text-green-400' },
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
        .reduce((acc, o) => acc + o.totalAmount, 0);
      return { name: dayStr, revenue };
    });
  }, [orders, isMounted]);

  const superModules = [
    { label: 'User Management', href: '/admin/users', icon: Users, desc: 'Manage users & roles' },
    { label: 'Product Management', href: '/admin/products', icon: Package, desc: 'Pricing & Catalog' },
    { label: 'Region Management', href: '/admin/regions', icon: Globe, desc: 'Global grid settings' },
    { label: 'Payment Settings', href: '/admin/settings/payments', icon: IndianRupee, desc: 'Gateway configuration' },
    { label: 'System Settings', href: '/admin/system', icon: Activity, desc: 'Kernel & Core logic' },
    { label: 'Backup Management', href: '/admin/backups', icon: Database, desc: 'Vault archives' },
  ];

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

      {/* Main Stats Grid - 2x2 on Mobile, 4 columns on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 px-1">
        {stats.map((stat, i) => (
          <Card key={i} className="h-[72px] bg-card border-border shadow-xl rounded-2xl overflow-hidden group hover:border-primary/30 transition-all">
            <CardContent className="p-3 flex items-center gap-3 h-full">
              <div className={`h-8 w-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center ${stat.color}`}>
                <stat.icon size={16} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black tracking-tighter leading-tight truncate">{stat.value}</h3>
                <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest truncate">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isSuper && (
        <section className="space-y-3">
           <div className="flex items-center gap-2 px-1">
              <ShieldCheck className="h-3 w-3 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Super Admin Command Center</h2>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {superModules.map((mod, i) => (
                <Link key={i} href={mod.href}>
                  <Card className="bg-card border-border h-[75px] rounded-2xl hover:border-primary/40 transition-all group flex items-center px-4 shadow-xl">
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                        <mod.icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[10px] font-black uppercase tracking-tight truncate leading-tight">{mod.label}</h4>
                        <p className="text-[7px] text-muted-foreground uppercase font-bold tracking-widest truncate">{mod.desc}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
           </div>
        </section>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Analytics - Compact Height */}
        <Card className="lg:col-span-2 bg-card border-border rounded-3xl overflow-hidden shadow-2xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest">Velocity (7D)</h3>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Sales Perf</span>
            </div>
          </div>
          <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
          </div>
        </Card>

        {/* Order Pipeline - Compact Items */}
        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl p-5 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest">Pipeline</h3>
          <div className="space-y-2">
            {[
              { label: 'Pending', count: orders?.filter(o => o.status === 'pending').length || 0, icon: Clock, color: 'text-orange-400' },
              { label: 'Processing', count: orders?.filter(o => o.status === 'processing').length || 0, icon: TrendingUp, color: 'text-accent' },
              { label: 'Completed', count: orders?.filter(o => o.status === 'completed').length || 0, icon: CheckCircle2, color: 'text-green-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center bg-black/40 ${stat.color}`}>
                    <stat.icon size={14} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                </div>
                <span className="text-lg font-black leading-none">{stat.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
