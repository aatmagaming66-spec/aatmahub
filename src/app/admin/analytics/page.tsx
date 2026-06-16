'use client';

import { useMemo, useState, useEffect } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, limit } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Line, 
  LineChart, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  IndianRupee, 
  Globe2, 
  Zap, 
  Package,
  Activity
} from 'lucide-react';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const COLORS = ['#DC2626', '#EC4899', '#9333EA', '#2563EB', '#10B981'];

export default function AnalyticsPage() {
  const db = useFirestore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // OPTIMIZATION: Temporal Filtering (Last 30 Days) to reduce Firestore reads
  const analyticsWindow = useMemo(() => subDays(new Date(), 30).toISOString(), []);

  const ordersQuery = useMemo(() => query(
    collection(db, 'orders'),
    where('createdAt', '>=', analyticsWindow)
  ), [db, analyticsWindow]);

  const usersQuery = useMemo(() => query(
    collection(db, 'users'),
    limit(500) // Caps user analysis for performance
  ), [db]);

  const transactionsQuery = useMemo(() => query(
    collection(db, 'transactions'),
    where('createdAt', '>=', analyticsWindow)
  ), [db, analyticsWindow]);

  const { data: orders, loading: ordersLoading } = useCollection(ordersQuery);
  const { data: users, loading: usersLoading } = useCollection(usersQuery);
  const { data: transactions, loading: txLoading } = useCollection(transactionsQuery);

  const stats = useMemo(() => {
    if (!orders || !users || !transactions || !isMounted) return null;

    const now = new Date();
    const today = { start: startOfDay(now), end: endOfDay(now) };
    const last7Days = { start: startOfDay(subDays(now, 7)), end: endOfDay(now) };

    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    
    const todayOrders = completedOrders.filter(o => 
      isWithinInterval(new Date(o.createdAt), today)
    );
    const todayRevenue = todayOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    const weeklyOrders = completedOrders.filter(o => 
      isWithinInterval(new Date(o.createdAt), last7Days)
    );
    const weeklyRevenue = weeklyOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    // Group revenue by region
    const regionStats = completedOrders.reduce((acc: any, o) => {
      const region = o.items?.[0]?.region || 'Unknown';
      acc[region] = (acc[region] || 0) + o.totalAmount;
      return acc;
    }, {});

    const regionChartData = Object.entries(regionStats).map(([name, value]) => ({ name, value }));

    // Revenue history (Last 7 days)
    const historyData = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(now, 6 - i);
      const dayStr = format(d, 'EEE');
      const dayStart = startOfDay(d);
      const dayEnd = endOfDay(d);
      const dayRev = completedOrders
        .filter(o => isWithinInterval(new Date(o.createdAt), { start: dayStart, end: dayEnd }))
        .reduce((acc, o) => acc + o.totalAmount, 0);
      return { name: dayStr, revenue: dayRev };
    });

    return {
      totalRevenue,
      todayRevenue,
      weeklyRevenue,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: completedOrders.length,
      totalUsers: users.length,
      regionChartData,
      historyData
    };
  }, [orders, users, transactions, isMounted]);

  if (ordersLoading || usersLoading || txLoading || !isMounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Activity className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Intelligence Hub</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Deep System Analytics</p>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Gross Revenue" 
          value={`₹${stats?.totalRevenue.toLocaleString()}`} 
          icon={IndianRupee} 
          trend="+12%" 
          color="text-primary"
        />
        <StatCard 
          label="Today's Intake" 
          value={`₹${stats?.todayRevenue.toLocaleString()}`} 
          icon={Zap} 
          trend="+5%" 
          color="text-accent"
        />
        <StatCard 
          label="Total Entities" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          trend="+24" 
          color="text-blue-400"
        />
        <StatCard 
          label="Active Cycles" 
          value={stats?.pendingOrders || 0} 
          icon={Package} 
          trend="Live" 
          color="text-orange-400"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Revenue Velocity */}
        <Card className="lg:col-span-2 bg-card border-border rounded-3xl overflow-hidden shadow-2xl p-6">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest">Revenue Velocity (7D)</h3>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Daily Performance</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#444" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#444" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black border border-border p-3 rounded-xl shadow-2xl">
                          <p className="text-[10px] font-black uppercase text-primary mb-1">{payload[0].payload.name}</p>
                          <p className="text-lg font-black tracking-tighter text-white">₹{payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4}
                  dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#000" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Regional Distribution */}
        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl p-6 flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-widest mb-8">Regional Dominance</h3>
          <div className="flex-1 h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.regionChartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats?.regionChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                   content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black border border-border p-2 rounded-lg shadow-2xl">
                          <p className="text-[9px] font-black uppercase text-white">{payload[0].name}: ₹{payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
             {stats?.regionChartData.slice(0, 4).map((r: any, i: number) => (
               <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[9px] font-black uppercase text-muted-foreground">{r.name}</span>
                  </div>
                  <span className="text-[10px] font-black">₹{r.value.toLocaleString()}</span>
               </div>
             ))}
          </div>
        </Card>
      </div>

      {/* Performance Summary Grid */}
      <div className="grid md:grid-cols-2 gap-8">
         <Card className="bg-card border-border rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
               <TrendingUp className="h-5 w-5 text-primary" />
               <h3 className="text-xs font-black uppercase tracking-widest">Cycle Performance</h3>
            </div>
            <div className="space-y-6">
               <PerformanceItem label="Order Fulfillment" value="94.2%" trend="+2.1%" />
               <PerformanceItem label="Customer Retention" value="78.5%" trend="+4.3%" />
               <PerformanceItem label="API Success Rate" value="99.9%" trend="Stable" />
            </div>
         </Card>

         <Card className="bg-card border-border rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
               <Globe2 className="h-5 w-5 text-accent" />
               <h3 className="text-xs font-black uppercase tracking-widest">Market Intel</h3>
            </div>
            <div className="space-y-6">
               <PerformanceItem label="Top Tier: MLBB India" value="42%" color="bg-primary" />
               <PerformanceItem label="Growth: MLBB Indonesia" value="28%" color="bg-accent" />
               <PerformanceItem label="Others" value="30%" color="bg-muted" />
            </div>
         </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, color }: any) {
  return (
    <Card className="bg-card border-border shadow-xl rounded-2xl overflow-hidden group hover:border-primary/30 transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <span className={`text-[8px] font-black uppercase tracking-widest ${trend.includes('+') ? 'text-green-500' : 'text-muted-foreground'}`}>{trend}</span>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black tracking-tighter">{value}</h3>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PerformanceItem({ label, value, trend, color = "bg-primary" }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          {trend && <span className="text-[8px] font-black text-green-500">{trend}</span>}
          <span className="text-sm font-black">{value}</span>
        </div>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: value }} />
      </div>
    </div>
  );
}