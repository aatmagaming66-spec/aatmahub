
'use client';

import { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, updateDoc, doc, orderBy, query } from 'firebase/firestore';
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
import { Search, Shield, User, Mail, MoreVertical, Crown, Loader2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminUsersPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users, loading } = useCollection(
    query(collection(db, 'users'), orderBy('createdAt', 'desc'))
  );

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user => 
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-primary/20 text-primary border-primary/20';
      case 'admin': return 'bg-accent/20 text-accent border-accent/20';
      default: return 'bg-white/5 text-muted-foreground border-white/5';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">User Management</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">HUB IDENTITY REGISTRY</p>
        </div>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search by Name or Email..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border pl-12 h-12 rounded-2xl text-xs font-bold focus:border-primary shadow-xl"
        />
      </div>

      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-black/20">
            <TableRow className="border-border">
              <TableHead className="text-[9px] font-black uppercase tracking-widest py-6 px-6">Identity</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Access Role</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Registry Date</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest text-right px-6">Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accessing Core Registry...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">No Identities Found</span>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.uid} className="border-border hover:bg-white/5 transition-colors">
                  <TableCell className="py-6 px-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100/100`} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                          {user.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-black uppercase tracking-tight leading-none">{user.fullName}</p>
                        <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1.5">
                          <Mail className="h-3 w-3" /> {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       {user.role === 'super_admin' ? <Crown className="h-3 w-3 text-primary" /> : <Shield className="h-3 w-3 text-accent" />}
                       <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${getRoleStyle(user.role)}`}>
                        {user.role?.replace('_', ' ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                       <Calendar className="h-3 w-3" />
                       <span className="text-[10px] font-black uppercase">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
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
                        <DropdownMenuItem onClick={() => updateRole(user.uid, 'user')} className="text-[10px] font-black uppercase tracking-widest p-3">
                          Set as User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateRole(user.uid, 'admin')} className="text-[10px] font-black uppercase tracking-widest p-3 text-accent">
                          Promote Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest p-3 text-primary">
                          Restrict Access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
