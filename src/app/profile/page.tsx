'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogOut, ArrowRight, ShieldCheck, Wallet, Loader2, Crown, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { RankAvatar } from '@/components/ui/rank-avatar';
import { getRankFromSpend, DEFAULT_RANKS, type RankDefinition } from '@/lib/ranks';

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

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      <div className="p-8 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent border-b border-border">
        <div className="flex items-center gap-6">
          <RankAvatar 
            src={`https://picsum.photos/seed/${user.uid}/200/200`}
            rank={rankInfo.name}
            size="xl"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-headline font-black tracking-tighter uppercase leading-none">{profile?.fullName || 'Aatma Member'}</h2>
              <Link href="/wallet#rank-center">
                <div className="h-6 px-2 bg-white/5 border border-white/10 rounded-lg flex items-center gap-1.5 hover:bg-primary/20 transition-all cursor-pointer">
                  <Star size={10} style={{ color: rankInfo.color }} className="fill-current" />
                  <span className="text-[8px] font-black uppercase text-white/60">{rankInfo.name}</span>
                </div>
              </Link>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">HUB ID: {user.uid.substring(0, 10).toUpperCase()}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="bg-primary/20 text-primary text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
                {profile?.role?.replace('_', ' ') || 'User'}
              </span>
              <span className="bg-white/5 text-white/40 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">
                Prestige Level: {rankInfo.sortOrder + 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isAdmin && (
          <Link href="/admin">
            <Button className="w-full h-16 bg-primary hover:bg-secondary font-black text-[11px] uppercase tracking-[0.2em] gap-3 rounded-2xl shadow-2xl shadow-primary/20 group">
              <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
              Admin Command Center
              <ArrowRight size={16} />
            </Button>
          </Link>
        )}

        <Link href="/wallet">
          <Card className="bg-card border-border rounded-3xl p-6 flex items-center justify-between group hover:border-primary/40 transition-all shadow-xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20"><Wallet className="text-primary h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Available Credits</p>
                <p className="text-2xl font-black text-white">₹{wallet?.balance?.toLocaleString() || '0'}.00</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
          </Card>
        </Link>

        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="p-6 border-b border-border">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xs font-black uppercase tracking-widest">Hub Identity</CardTitle>
              <Button variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-primary" onClick={() => setEditing(!editing)}>
                {editing ? "Discard" : "Update Profile"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                <Input disabled={!editing} value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Phone Link</Label>
                <Input disabled={!editing} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold" />
              </div>
            </div>
            {editing && (
              <Button onClick={handleUpdate} disabled={saving} className="w-full mt-4 h-12 bg-primary font-black uppercase text-[10px] tracking-widest rounded-xl">
                {saving ? <Loader2 className="animate-spin" /> : "Commit Changes"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" onClick={handleLogout} className="w-full h-14 border-primary/20 text-primary hover:bg-primary/5 font-black text-[10px] uppercase tracking-[0.2em] gap-3 rounded-2xl transition-all">
          <LogOut size={18} /> Terminate Session
        </Button>
      </div>
    </div>
  );
}
