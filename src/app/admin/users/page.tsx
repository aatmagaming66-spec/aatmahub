'use client';

import { useState, useMemo, memo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, updateDoc, doc, orderBy, query, increment, limit } from 'firebase/firestore';
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
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Search, Shield, MoreVertical, Crown, Loader2, Wallet, Ban, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { RankAvatar } from '@/components/ui/rank-avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [adjustingUser, setAdjustingUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // OPTIMIZATION: Memoized query with limit to ensure < 2s load time
  const usersQuery = useMemo(() => query(
    collection(db, 'users'), 
    orderBy('createdAt', 'desc'),
    limit(20) // Initial batch optimization
  ), [db]);

  const { data: users, loading } = useCollection(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user => 
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.uid?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const updateRole = async (uid: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      toast({ title: "Role Updated", description: `User role changed to ${newRole}.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Update Failed", description: error.message });
    }
  };

  const handleWalletAdjustment = async () => {
    if (!adjustingUser || !adjustAmount) return;
    setIsAdjusting(true);
    try {
      const walletRef = doc(db, 'wallets', adjustingUser.uid);
      await updateDoc(walletRef, { 
        balance: increment(Number(adjustAmount)),
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Wallet Synchronized", description: `Adjusted balance by ₹${adjustAmount} for ${adjustingUser.fullName}` });
      setAdjustingUser(null);
      setAdjustAmount('');
    } catch (e: any) {
      toast({ variant: 'destructive', title: "Adjustment Failed", description: e.message });
    } finally {
      setIsAdjusting(false);
    }
  };

  const toggleBan = async (uid: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { banned: !currentStatus });
      toast({ 
        title: currentStatus ? "Access Restored" : "Entity Restricted", 
        description: `User session permissions updated.` 
      });
    } catch (e: any) {
      toast({ variant: 'destructive', title: "Action Failed", description: e.message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">User Management</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Full Identity Lifecycle Control</p>
        </div>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search by Name, Email or UID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border pl-12 h-14 rounded-none text-xs font-bold focus:border-primary shadow-xl"
        />
      </div>

      <div className="bg-card border border-border rounded-none overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-black/20">
            <TableRow className="border-border">
              <TableHead className="text-[9px] font-black uppercase tracking-widest py-6 px-6">Identity</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Access Tier</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest text-right px-6">Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border opacity-40">
                  <TableCell className="py-6 px-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-none bg-white/5" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 bg-white/5" />
                        <Skeleton className="h-3 w-48 bg-white/5" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-6 w-20 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 bg-white/5" /></TableCell>
                  <TableCell className="text-right px-6"><Skeleton className="h-8 w-8 ml-auto rounded-none bg-white/5" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">No Identities Found</span>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <UserRow 
                  key={user.uid} 
                  user={user} 
                  updateRole={updateRole} 
                  toggleBan={toggleBan} 
                  setAdjustingUser={setAdjustingUser} 
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!adjustingUser} onOpenChange={() => setAdjustingUser(null)}>
        <DialogContent className="bg-card border-border rounded-none p-8 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Wallet Adjustment</DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Modify balance for: {adjustingUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
             <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Amount (₹)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 100 or -100" 
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="bg-black/50 border-border h-14 rounded-none text-xl font-black text-primary"
                />
                <p className="text-[8px] text-muted-foreground uppercase font-black">Use negative value to deduct funds.</p>
             </div>
          </div>
          <DialogFooter>
            <Button onClick={handleWalletAdjustment} disabled={isAdjusting} className="w-full bg-primary h-14 rounded-none font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
              {isAdjusting ? <Loader2 className="animate-spin" /> : "Commit Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const UserRow = memo(function UserRow({ user, updateRole, toggleBan, setAdjustingUser }: any) {
  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-primary/20 text-primary border-primary/20';
      case 'admin': return 'bg-accent/20 text-accent border-accent/20';
      default: return 'bg-white/5 text-muted-foreground border-white/5';
    }
  };

  return (
    <TableRow className={cn("border-border hover:bg-white/5 transition-colors", user.banned && "bg-primary/5 opacity-60")}>
      <TableCell className="py-6 px-6">
        <div className="flex items-center gap-4">
          <RankAvatar 
            rank={user.currentRank || 'Warrior'}
            size="md"
            fallback={user.fullName?.charAt(0)}
          />
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-tight leading-none">{user.fullName}</p>
            <p className="text-[9px] text-muted-foreground font-bold flex items-center gap-1.5 uppercase">
              {user.email}
            </p>
            <p className="text-[7px] text-white/20 font-mono uppercase tracking-tighter">UID: {user.uid}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
           {user.role === 'super_admin' ? <Crown className="h-3 w-3 text-primary" /> : <Shield className="h-3 w-3 text-accent" />}
           <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-none border ${getRoleStyle(user.role)}`}>
            {user.role?.replace('_', ' ')}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-none border inline-block w-fit ${
            user.banned ? 'bg-primary/20 text-primary border-primary/20' : 'bg-green-500/10 text-green-500 border-green-500/10'
          }`}>
            {user.banned ? 'RESTRICTED' : 'ACTIVE'}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right px-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-none hover:bg-white/10">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border min-w-[160px]">
            <DropdownMenuItem onClick={() => setAdjustingUser(user)} className="text-[10px] font-black uppercase tracking-widest p-3 gap-2">
              <Wallet size={12} className="text-primary" /> Adjust Wallet
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={() => updateRole(user.uid, 'user')} className="text-[10px] font-black uppercase tracking-widest p-3">
              Set as User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateRole(user.uid, 'admin')} className="text-[10px] font-black uppercase tracking-widest p-3 text-accent">
              Promote Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={() => toggleBan(user.uid, user.banned)} className="text-[10px] font-black uppercase tracking-widest p-3 text-primary flex justify-between">
              {user.banned ? <><CheckCircle2 size={12} /> Restore Access</> : <><Ban size={12} /> Ban User</>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});
