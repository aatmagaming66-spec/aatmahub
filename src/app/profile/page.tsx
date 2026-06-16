'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, collection, query, where } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  LogOut, 
  ArrowRight, 
  ShieldCheck, 
  Wallet, 
  Loader2, 
  Crown, 
  Zap, 
  Star, 
  Copy, 
  CheckCircle2, 
  ChevronRight, 
  User, 
  ImagePlus, 
  Bell, 
  Lock, 
  History, 
  Shield, 
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { RankAvatar } from '@/components/ui/rank-avatar';
import { getRankFromSpend, DEFAULT_RANKS, type RankDefinition } from '@/lib/ranks';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, profile, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const walletRef = useMemo(() => user ? doc(db, 'wallets', user.uid) : null, [user, db]);
  const { data: wallet } = useDoc(walletRef);

  const transactionsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'transactions'), where('userId', '==', user.uid));
  }, [user, db]);
  const { data: transactions } = useCollection(transactionsQuery);

  const lifetimeSpend = useMemo(() => {
    if (!transactions) return 0;
    return transactions
      .filter(tx => tx.type === 'purchase' && tx.status === 'success')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  }, [transactions]);

  const rankInfo = useMemo(() => {
    return getRankFromSpend(lifetimeSpend, DEFAULT_RANKS);
  }, [lifetimeSpend]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhoneNumber(profile.phoneNumber || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to logout.' });
    }
  };

  const copyId = () => {
    if (!user?.uid) return;
    navigator.clipboard.writeText(user.uid);
    toast({ title: "ID Copied", description: "Hub ID saved to clipboard." });
  };

  const handleUpdate = () => {
    if (!user || !profile) return;
    if (!fullName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Full name is required.' });
      return;
    }

    setSaving(true);
    const userDocRef = doc(db, 'users', user.uid);
    const updateData = {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
    };

    updateDoc(userDocRef, updateData)
      .then(() => {
        toast({ title: "Profile Updated", description: "Details synchronized." });
        setEditing(false);
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userDocRef.path, operation: 'update', requestResourceData: updateData
        }));
      })
      .finally(() => setSaving(false));
  };

  if (userLoading || !user) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
    </div>
  );

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const lastLogin = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  }) : 'N/A';

  const SETTINGS_OPTIONS = [
    { icon: User, label: 'Edit Profile', action: () => setEditing(!editing) },
    { icon: ImagePlus, label: 'Change Profile Photo', href: '#' },
    { icon: Star, label: 'Change Display Name', action: () => setEditing(true) },
    { icon: Bell, label: 'Notification Settings', href: '#' },
    { icon: Lock, label: 'Security Settings', href: '#' },
    { icon: History, label: 'Login Activity', href: '#' },
    { icon: Shield, label: 'Privacy Settings', href: '#' },
  ];

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700 pb-24">
      {/* PREMIUM VIP HEADER */}
      <div className="relative p-8 bg-gradient-to-b from-primary/20 via-primary/5 to-background border-b border-white/5 rounded-b-[2.5rem] overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12">
          <Shield size={200} className="text-primary" />
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          <RankAvatar 
            src={`https://picsum.photos/seed/${user.uid}/200/200`}
            rank={rankInfo.name}
            size="2xl"
            className="shadow-2xl"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-headline font-black tracking-tighter uppercase leading-none truncate max-w-[160px]">
                {profile?.fullName || 'Aatma Member'}
              </h2>
              <div className="px-2 py-0.5 bg-primary/20 border border-primary/30 rounded-lg flex items-center gap-1.5 shadow-lg">
                <Crown size={10} className="text-primary fill-primary" />
                <span className="text-[8px] font-black uppercase text-primary tracking-widest">{rankInfo.name}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 group cursor-pointer" onClick={copyId}>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Hub ID: {user.uid.substring(0, 10).toUpperCase()}</p>
                <Copy size={10} className="text-white/20 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Last Login: {lastLogin}</p>
            </div>
          </div>
        </div>

        {/* QUICK STATUS ROW */}
        <div className="flex items-center gap-2 mt-8">
           <StatusBadge label={profile?.role?.replace('_', ' ') || 'User'} icon={isAdmin ? Crown : User} active />
           <StatusBadge label={`Level ${rankInfo.sortOrder + 1}`} icon={Star} active={rankInfo.sortOrder > 0} />
           <StatusBadge label="Verified" icon={CheckCircle2} active />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ADMIN COMMAND CENTER */}
        {isAdmin && (
          <Link href="/admin">
            <Button className="w-full h-16 bg-primary hover:bg-secondary font-black text-[11px] uppercase tracking-[0.2em] gap-3 rounded-2xl shadow-2xl shadow-primary/20 group border-none">
              <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
              Admin Command Center
              <ArrowRight size={16} />
            </Button>
          </Link>
        )}

        {/* AVAILABLE CREDITS */}
        <Link href="/wallet">
          <Card className="bg-card border-border rounded-3xl p-6 flex items-center justify-between group hover:border-primary/40 transition-all shadow-xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20"><Wallet className="text-primary h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Wallet Balance</p>
                <p className="text-2xl font-black text-white">₹{wallet?.balance?.toLocaleString() || '0'}.00</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
          </Card>
        </Link>

        {/* ACCOUNT SETTINGS SECTION */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <Settings size={14} className="text-primary" />
             <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">Account Settings</h3>
          </div>
          <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              {SETTINGS_OPTIONS.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={opt.action}
                  className="w-full flex items-center justify-between p-5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:text-primary transition-colors">
                      <opt.icon size={16} />
                    </div>
                    <span className="text-xs font-bold text-white/90 uppercase tracking-tight">{opt.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-primary transition-all" />
                </button>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* HUB IDENTITY (OLD SECTION UPDATED) */}
        {editing && (
          <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-top-4 duration-500">
            <CardHeader className="p-6 border-b border-border bg-white/5">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs font-black uppercase tracking-widest">Update Identity</CardTitle>
                <Button variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-primary" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Phone Link</Label>
                  <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold" />
                </div>
              </div>
              <Button onClick={handleUpdate} disabled={saving} className="w-full mt-2 h-12 bg-primary font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-primary/20">
                {saving ? <Loader2 className="animate-spin" /> : "Commit Changes"}
              </Button>
            </CardContent>
          </Card>
        )}

        <Button variant="outline" onClick={handleLogout} className="w-full h-14 border-white/5 text-muted-foreground hover:text-primary hover:bg-primary/5 font-black text-[10px] uppercase tracking-[0.2em] gap-3 rounded-2xl transition-all">
          <LogOut size={18} /> Logout
        </Button>

        <div className="flex flex-col items-center justify-center gap-2 pt-4 opacity-20">
           <Zap size={12} className="text-primary" />
           <p className="text-[7px] font-black uppercase tracking-[0.4em]">Aatma HUB</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, icon: Icon, active }: { label: string, icon: any, active?: boolean }) {
  return (
    <div className={cn(
      "px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all shadow-lg",
      active ? "bg-white/5 border-white/10 text-white" : "bg-black/20 border-white/5 text-white/30"
    )}>
      <Icon size={12} className={active ? "text-primary" : "text-white/20"} />
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}
