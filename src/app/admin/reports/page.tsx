
'use client';

import { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ReportsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [reportType, setReportsType] = useState('orders');
  const [dateRange, setDateRange] = useState('7');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: orders, loading: ordersLoading } = useCollection(collection(db, 'orders'));
  const { data: users, loading: usersLoading } = useCollection(collection(db, 'users'));
  const { data: transactions, loading: txLoading } = useCollection(collection(db, 'transactions'));

  const filteredData = useMemo(() => {
    let source: any[] = [];
    if (reportType === 'orders') source = orders || [];
    if (reportType === 'users') source = users || [];
    if (reportType === 'transactions') source = transactions || [];

    const now = new Date();
    const interval = {
      start: startOfDay(subDays(now, parseInt(dateRange))),
      end: endOfDay(now)
    };

    return source.filter(item => {
      const date = new Date(item.createdAt || item.timestamp);
      const matchesDate = isWithinInterval(date, interval);
      
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || (
        (item.orderId?.toLowerCase().includes(searchStr)) ||
        (item.fullName?.toLowerCase().includes(searchStr)) ||
        (item.email?.toLowerCase().includes(searchStr)) ||
        (item.transactionId?.toLowerCase().includes(searchStr))
      );

      return matchesDate && matchesSearch;
    });
  }, [reportType, dateRange, searchQuery, orders, users, transactions]);

  const exportCSV = () => {
    if (filteredData.length === 0) {
      toast({ variant: 'destructive', title: 'Export Failed', description: 'No data matches the current criteria.' });
      return;
    }

    const headers = Object.keys(filteredData[0]).filter(k => typeof filteredData[0][k] !== 'object');
    const rows = filteredData.map(item => headers.map(header => JSON.stringify(item[header])).join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `aatma-report-${reportType}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: 'Export Complete', description: 'Report generated and downloaded successfully.' });
  };

  const loading = ordersLoading || usersLoading || txLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Data Registry</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">System-wide Reporting Protocol</p>
        </div>
        <Button 
          onClick={exportCSV}
          disabled={loading || filteredData.length === 0}
          className="bg-primary h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export Ledger (.CSV)
        </Button>
      </header>

      {/* Control Panel */}
      <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl">
        <CardContent className="p-8 grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Report Module</span>
            <Select value={reportType} onValueChange={setReportsType}>
              <SelectTrigger className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold">
                <SelectValue placeholder="Select Logic" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="orders" className="text-[10px] font-black uppercase">Order Ledger</SelectItem>
                <SelectItem value="users" className="text-[10px] font-black uppercase">Identity Registry</SelectItem>
                <SelectItem value="transactions" className="text-[10px] font-black uppercase">Financial Cycle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Temporal Range</span>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold">
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="1" className="text-[10px] font-black uppercase">Last 24 Hours</SelectItem>
                <SelectItem value="7" className="text-[10px] font-black uppercase">Last 7 Cycles</SelectItem>
                <SelectItem value="30" className="text-[10px] font-black uppercase">Last 30 Cycles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Secure Search</span>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="ID, Name, or Email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/50 border-border pl-12 h-12 rounded-xl text-xs font-bold focus:border-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-black/20">
            <TableRow className="border-border">
              <TableHead className="text-[9px] font-black uppercase tracking-widest py-6 px-6">ID / Reference</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Entity / Origin</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Magnitude</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Sync Date</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest text-right px-6">Protocol Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synthesizing Records...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">No Logs Detected in current span</span>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, i) => (
                <TableRow key={i} className="border-border hover:bg-white/5 transition-colors">
                  <TableCell className="py-6 px-6">
                    <div className="flex items-center gap-2">
                       <FileText size={12} className="text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-tighter truncate max-w-[120px]">
                         {item.orderId || item.transactionId || item.uid}
                       </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-xs font-black uppercase text-white/90">{item.fullName || item.items?.[0]?.name || item.type}</p>
                      <p className="text-[8px] text-muted-foreground uppercase font-black">{item.email || 'System Operation'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-black text-white tracking-tighter">
                      {item.totalAmount || item.amount ? `₹${item.totalAmount || item.amount}` : '--'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[9px] font-black uppercase text-muted-foreground">
                      {format(new Date(item.createdAt || item.timestamp), 'dd MMM yyyy • HH:mm')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded border ${
                        item.status === 'completed' || item.status === 'success' || item.role 
                        ? 'bg-green-500/10 text-green-500 border-green-500/10' 
                        : 'bg-primary/10 text-primary border-primary/10'
                      }`}>
                        {item.status || item.role || 'Active'}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
