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
  Settings,
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
      const dayStart = startOfDay(d);
      const dayEnd = endOfDay(d);
      const revenue = orders
        .filter(o => o.status === 'completed' && isWithinInterval(new Date(o.createdAt), { start: dayStart, end: dayEnd }))
        .reduce((acc, o) => acc + o.totalAmount, 0);
      return { name: format(d, 'EEE'), revenue };
    });
  }, [orders, isMounted]);

  const superModules = [
    { label: 'User Management', href: '/admin/users', icon: Users, desc: 'Manage users, roles & access' },
    { label: 'Product Management', href: '/admin/products', icon: Package, desc: 'Manage products & pricing' },
    { label: 'Region Management', href: '/admin/regions', icon: Globe, desc: 'Manage regions & availability' },
    { label: 'Payment Settings', href: '/admin/settings/payments', icon: IndianRupee, desc: 'Manage payment gateways' },
    { label: 'System Settings', href: '/admin/system', icon: Activity, desc: 'Website & system configuration' },
    { label: 'Backup Management', href: '/admin/backups', icon: Database, desc: 'Database backups & restore' },
  ];

  if (!isMounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Operations Dashboard</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Real-time System Intelligence</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/analytics">
             <Card className="p-3 border-border rounded-xl flex items-center gap-3 bg-white/5 hover:border-primary transition-all group">
                <BarChart3 className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Analytics</p>
                  <p className="text-[10px] font-black uppercase text-white">Full View</p>
                </div>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
             </Card>
          </Link>
          <Link href="/admin/settings/telegram">
            <Card className={`p-3 border-border rounded-xl flex items-center gap-3 hover:border-primary transition-colors cursor-pointer ${tgStatus?.notificationsEnabled ? 'bg-primary/5' : 'bg-black/20 opacity-50'}`}>
              <Bot className={`h-5 w-5 ${tgStatus?.notificationsEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="text-left">
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Bot Sync</p>
                <p className="text-[10px] font-black uppercase text-white">{tgStatus?.notificationsEnabled ? 'Connected' : 'Offline'}</p>
              </div>
              <Zap className={`h-3 w-3 ${tgStatus?.notificationsEnabled ? 'text-primary' : 'text-white/10'}`} />
            </Card>
          </Link>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-xl rounded-2xl overflow-hidden group hover:border-primary/30 transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tighter">{stat.value}</h3>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isSuper && (
        <section className="space-y-4">
           <div className="flex items-center gap-3 px-1">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Super Admin Command Center</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {superModules.map((mod, i) => (
                <Link key={i} href={mod.href}>
                  <Card className="bg-card border-border p-5 rounded-3xl hover:border-primary/40 transition-all group flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <mod.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-tight">{mod.label}</h4>
                        <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">{mod.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Card>
                </Link>
              ))}
           </div>
        </section>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border rounded-3xl overflow-hidden shadow-2xl p-6">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest">Revenue Analytics (7D)</h3>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Sales Performance</span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-black border border-border p-3 rounded-xl shadow-2xl">
                        <p className="text-[10px] font-black uppercase text-primary mb-1">{payload[0].payload.name}</p>
                        <p className="text-lg font-black tracking-tighter text-white">₹{payload[0].value}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest">Order Pipeline</h3>
          <div className="space-y-4">
            {[
              { label: 'Pending', count: orders?.filter(o => o.status === 'pending').length || 0, icon: Clock, color: 'text-orange-400' },
              { label: 'Processing', count: orders?.filter(o => o.status === 'processing').length || 0, icon: TrendingUp, color: 'text-accent' },
              { label: 'Completed', count: orders?.filter(o => o.status === 'completed').length || 0, icon: CheckCircle2, color: 'text-green-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center bg-black/40 ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                </div>
                <span className="text-xl font-black">{stat.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
