'use client';

import { useState, useMemo, useEffect, memo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, updateDoc, doc, orderBy, query, limit } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Search, Filter, MoreVertical, Loader2, Smartphone, User, Hash, Zap, Cpu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminOrdersPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // OPTIMIZATION: Memoized query with limit to reduce initial Firestore reads
  const ordersQuery = useMemo(() => query(
    collection(db, 'orders'), 
    orderBy('createdAt', 'desc'),
    limit(100) // Prevents loading massive datasets unnecessarily
  ), [db]);

  const { data: orders, loading } = useCollection(ordersQuery);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(order => {
      const matchesSearch = order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           order.playerInfo?.playerId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast({ title: "Status Updated", description: `Order ${orderId} is now ${newStatus}.` });

      if (newStatus === 'processing') {
        fetch('/api/admin/fulfilment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        }).catch(e => console.error('Silent failover for fulfilment trigger'));
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Update Failed", description: error.message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Order Management</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Full Lifecycle Control</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-card border border-border px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span className="text-[9px] font-black uppercase text-muted-foreground">Recent Pool:</span>
              <span className="text-xs font-black text-primary">{filteredOrders.length}</span>
           </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search Order ID or Player ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card border-border pl-12 h-12 rounded-2xl text-xs font-bold focus:border-primary shadow-xl"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-12 px-6 rounded-2xl border-border bg-card font-black uppercase text-[10px] tracking-widest gap-2">
              <Filter className="h-4 w-4" /> {statusFilter === 'all' ? 'All Status' : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border min-w-[160px]">
            {['all', 'pending', 'processing', 'completed', 'cancelled', 'failed'].map((s) => (
              <DropdownMenuItem 
                key={s} 
                onClick={() => setStatusFilter(s)}
                className="text-[10px] font-black uppercase tracking-widest p-3 cursor-pointer"
              >
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-black/20">
            <TableRow className="border-border">
              <TableHead className="text-[9px] font-black uppercase tracking-widest py-6 px-6">Order Details</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Player Target</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Amount</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest text-right px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Retrieving Secure Records...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">No Transactions Detected</span>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <OrderRow key={order.id} order={order} isMounted={isMounted} updateStatus={updateStatus} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const OrderRow = memo(function OrderRow({ order, isMounted, updateStatus }: any) {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'processing': return 'bg-accent/10 text-accent border-accent/20';
      case 'pending': return 'bg-orange-400/10 text-orange-400 border-orange-400/20';
      case 'failed':
      case 'cancelled': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <TableRow className="border-border hover:bg-white/5 transition-colors">
      <TableCell className="py-6 px-6">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-primary">
            <Hash size={10} className="stroke-[3]" />
            <span className="text-[10px] font-black uppercase tracking-widest">{order.orderId?.replace('AH-2026-', '') || order.id}</span>
          </div>
          <p className="text-xs font-black uppercase text-white/90">{order.items?.[0]?.name}</p>
          <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">
            {isMounted ? `${new Date(order.createdAt).toLocaleDateString()} • ${new Date(order.createdAt).toLocaleTimeString()}` : '...'}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <User size={10} className="text-primary" />
            <span className="text-[10px] font-black uppercase">{order.playerInfo?.playerId || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Smartphone size={10} className="text-accent" />
            <span className="text-[10px] font-black uppercase opacity-60">SVR: {order.playerInfo?.serverId || 'N/A'}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm font-black text-white tracking-tighter">₹{order.totalAmount}</span>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
           <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border text-center ${getStatusStyle(order.status)}`}>
            {order.status}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right px-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border min-w-[140px]">
            <DropdownMenuItem onClick={() => updateStatus(order.id, 'processing')} className="text-[10px] font-black uppercase tracking-widest p-3">
              Processing (API)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateStatus(order.id, 'completed')} className="text-[10px] font-black uppercase tracking-widest p-3 text-green-400">
              Complete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateStatus(order.id, 'failed')} className="text-[10px] font-black uppercase tracking-widest p-3 text-primary">
              Mark Failed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});
