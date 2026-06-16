
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useGlobalSettings } from '@/firebase/settings-context';
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
import { RankAvatar } from '@/components/ui/rank-avatar';
import { getRankFromSpend } from '@/lib/ranks';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, profile, initialized } = useUser();
  const { ranks } = useGlobalSettings();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const walletRef = useMemo(() => user ? doc(db, 'wallets', user.uid) : null, [user, db]);
  const { data: wallet, loading: walletLoading } = useDoc(walletRef);

  const rankInfo = useMemo(() => {
    return getRankFromSpend(profile?.lifetimeSpend || 0, ranks);
  }, [profile, ranks]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhoneNumber(profile.phoneNumber || '');
    }
  }, [profile]);

  // Immediate Shell Render
  if (!initialized) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!user) { router.push('/login'); return null; }

  const handleLogout = async () => {
    try { await signOut(auth); router.push('/login'); } catch (e) { toast({ variant: 'destructive', title: 'Logout Failed' }); }
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  return (
    <div className="flex flex-col w-full animate-in fade-in pb-24">
      <div className="relative p-8 bg-gradient-to-b from-primary/20 via-primary/5 to-background border-b border-white/5 rounded-b-[2.5rem] overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12"><Shield size={200} className="text-primary" /></div>
        <div className="flex items-center gap-6 relative z-10">
          <RankAvatar src={`https://picsum.photos/seed/${user.uid}/200/200`} rank={rankInfo.name} size="2xl" className="shadow-2xl" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-headline font-black tracking-tighter uppercase leading-none truncate max-w-[160px]">{profile?.fullName || 'Aatma Member'}</h2>
              <div className="px-2 py-0.5 bg-primary/20 border border-primary/30 rounded-lg flex items-center gap-1.5 shadow-lg">
                <Crown size={10} className="text-primary fill-primary" />
                <span className="text-[8px] font-black uppercase text-primary tracking-widest">{rankInfo.name}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { navigator.clipboard.writeText(user.uid); toast({ title: 'ID Copied' }); }}>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Hub ID: {user.uid.substring(0, 10).toUpperCase()}</p>
                <Copy size={10} className="text-white/20 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-8">
           <div className="px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 bg-white/5 shadow-lg"><User size={12} className="text-primary" /><span className="text-[9px] font-black uppercase">{profile?.role?.replace('_', ' ') || 'User'}</span></div>
           <div className="px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 bg-white/5 shadow-lg"><Star size={12} className="text-primary" /><span className="text-[9px] font-black uppercase">Level {rankInfo.sortOrder + 1}</span></div>
           <div className="px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 bg-white/5 shadow-lg"><CheckCircle2 size={12} className="text-primary" /><span className="text-[9px] font-black uppercase">Verified</span></div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isAdmin && (
          <Link href="/admin"><Button className="w-full h-16 bg-primary font-black text-[11px] uppercase tracking-[0.2em] gap-3 rounded-2xl shadow-2xl group border-none"><ShieldCheck size={20} /> Admin Command Center <ArrowRight size={16} /></Button></Link>
        )}

        <Link href="/wallet">
          <Card className="bg-card border-border rounded-3xl p-6 flex items-center justify-between group hover:border-primary/40 transition-all shadow-xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20"><Wallet className="text-primary h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Wallet Balance</p>
                {walletLoading ? <Skeleton className="h-8 w-24 bg-white/5" /> : <p className="text-2xl font-black text-white">₹{wallet?.balance?.toLocaleString() || '0'}.00</p>}
              </div>
            </div>
            <ArrowRight size={20} className="text-primary" />
          </Card>
        </Link>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1"><Settings size={14} className="text-primary" /><h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">Account Settings</h3></div>
          <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              {[
                { icon: User, label: 'Edit Profile', action: () => setEditing(!editing) },
                { icon: ImagePlus, label: 'Profile Photo', action: () => {} },
                { icon: Bell, label: 'Notifications', action: () => {} },
                { icon: Lock, label: 'Security', action: () => {} }
              ].map((opt, i) => (
                <button key={i} onClick={opt.action} className="w-full flex items-center justify-between p-5 border-b border-white/5 last:border-0 hover:bg-white/5 group">
                  <div className="flex items-center gap-4"><div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:text-primary"><opt.icon size={16} /></div><span className="text-xs font-bold text-white/90 uppercase">{opt.label}</span></div>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-primary" />
                </button>
              ))}
            </CardContent>
          </Card>
        </section>

        {editing && (
          <Card className="bg-card border-border rounded-3xl p-6 space-y-4 animate-in slide-in-from-top-4">
            <div className="flex justify-between items-center"><h4 className="text-xs font-black uppercase text-primary">Update Identity</h4><Button variant="ghost" className="text-[9px] uppercase" onClick={() => setEditing(false)}>Cancel</Button></div>
            <div className="space-y-4">
              <div className="space-y-2"><Label className="text-[9px] uppercase font-black opacity-60">Full Name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-black/50 border-border h-12 rounded-xl focus:border-primary" /></div>
              <div className="space-y-2"><Label className="text-[9px] uppercase font-black opacity-60">Phone</Label><Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-black/50 border-border h-12 rounded-xl focus:border-primary" /></div>
              <Button onClick={async () => { setSaving(true); try { await updateDoc(doc(db, 'users', user.uid), { fullName, phoneNumber }); setEditing(false); toast({ title: 'Profile Synced' }); } finally { setSaving(false); } }} disabled={saving} className="w-full bg-primary font-black uppercase text-[10px] h-12 rounded-xl">{saving ? <Loader2 className="animate-spin" /> : 'Save Changes'}</Button>
            </div>
          </Card>
        )}

        <Button variant="outline" onClick={handleLogout} className="w-full h-14 border-white/5 text-muted-foreground hover:text-primary font-black text-[10px] uppercase tracking-[0.2em] gap-3 rounded-2xl">
          <LogOut size={18} /> Logout
        </Button>
      </div>
    </div>
  );
}
