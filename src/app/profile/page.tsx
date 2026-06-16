'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { useGlobalSettings } from '@/firebase/settings-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  LogOut, 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  Crown, 
  Copy, 
  ChevronRight, 
  User, 
  Bell, 
  Lock, 
  Settings,
  Shield,
  LogIn,
  Key,
  Clock,
  Link as LinkIcon,
  Fingerprint
} from 'lucide-react';
import Link from 'next/link';
import { RankAvatar } from '@/components/ui/rank-avatar';
import { getRankFromSpend } from '@/lib/ranks';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * AATMA HUB Simplified Profile Hub
 * Focused exclusively on account management and security.
 */
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

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhoneNumber(profile.phoneNumber || '');
    }
  }, [profile]);

  const rankInfo = useMemo(() => {
    return getRankFromSpend(profile?.lifetimeSpend || 0, ranks);
  }, [profile, ranks]);

  const handleLogout = async () => {
    try { 
      await signOut(auth); 
      router.replace('/login'); 
    } catch (e) { 
      toast({ variant: 'destructive', title: 'Logout Failed' }); 
    }
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  // GUEST STATE
  if (initialized && !user) {
    return (
      <div className="flex flex-col w-full animate-in fade-in duration-300 pb-24">
        <div className="relative p-8 bg-gradient-to-b from-primary/20 via-primary/5 to-background border-b border-white/5 rounded-b-[2.5rem] overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12"><Shield size={200} className="text-primary" /></div>
          <div className="flex flex-col items-center justify-center gap-6 py-10 relative z-10">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <User size={40} className="text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-headline font-black uppercase tracking-tighter">Guest Protocol</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Authentication required for Hub access</p>
            </div>
            <Link href="/login" className="w-full max-w-xs">
              <Button className="w-full h-14 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 gap-3">
                <LogIn size={18} /> Establish Connection
              </Button>
            </Link>
            <Link href="/register" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
              Initialize New Identity
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED STATE
  return (
    <div className="flex flex-col w-full animate-in fade-in duration-500 pb-24">
      <div className="relative p-8 bg-gradient-to-b from-primary/20 via-primary/5 to-background border-b border-white/5 rounded-b-[2.5rem] overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12"><Shield size={200} className="text-primary" /></div>
        <div className="flex items-center gap-6 relative z-10">
          {!initialized ? (
             <div className="relative"><Skeleton className="h-24 w-24 rounded-full bg-white/5" /><div className="absolute inset-0 border-2 border-white/5 rounded-full" /></div>
          ) : (
            <RankAvatar src={`https://picsum.photos/seed/${user?.uid}/200/200`} rank={rankInfo.name} size="2xl" className="shadow-2xl" />
          )}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              {!initialized || !profile ? (
                <Skeleton className="h-6 w-32 bg-white/5" />
              ) : (
                <h2 className="text-2xl font-headline font-black tracking-tighter uppercase leading-none truncate max-w-[160px]">{profile?.fullName || 'Aatma Member'}</h2>
              )}
              {profile && (
                <div className="px-2 py-0.5 bg-primary/20 border border-primary/30 rounded-lg flex items-center gap-1.5 shadow-lg">
                  <Crown size={10} className="text-primary fill-primary" />
                  <span className="text-[8px] font-black uppercase text-primary tracking-widest">{rankInfo.name}</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { if (user) { navigator.clipboard.writeText(user.uid); toast({ title: 'ID Copied' }); } }}>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                  Hub ID: {user ? user.uid.substring(0, 10).toUpperCase() : '----------'}
                </p>
                {user && <Copy size={10} className="text-white/20 group-hover:text-primary transition-colors" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {isAdmin && (
          <Link href="/admin">
            <Button className="w-full h-16 bg-primary font-black text-[11px] uppercase tracking-[0.2em] gap-3 rounded-2xl shadow-2xl group border-none">
              <ShieldCheck size={20} /> Admin Command Center <ArrowRight size={16} />
            </Button>
          </Link>
        )}

        {/* Account Protocols Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Settings size={14} className="text-primary" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">Account Protocols</h3>
          </div>
          <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              <button onClick={() => setEditing(!editing)} className="w-full flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 group transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-primary"><User size={16} /></div>
                  <span className="text-xs font-bold text-white/90 uppercase">Edit Profile</span>
                </div>
                <ChevronRight size={16} className={cn("text-white/20 transition-transform", editing && "rotate-90")} />
              </button>

              <Link href="/profile/change-password">
                <button className="w-full flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 group transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-accent"><Key size={16} /></div>
                    <span className="text-xs font-bold text-white/90 uppercase">Change Password</span>
                  </div>
                  <ChevronRight size={16} className="text-white/20" />
                </button>
              </Link>

              <button className="w-full flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 group transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-primary"><Bell size={16} /></div>
                  <span className="text-xs font-bold text-white/90 uppercase">Notification Settings</span>
                </div>
                <ChevronRight size={16} className="text-white/20" />
              </button>

              <button className="w-full flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 group transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-accent"><Fingerprint size={16} /></div>
                  <span className="text-xs font-bold text-white/90 uppercase">Security Settings</span>
                </div>
                <ChevronRight size={16} className="text-white/20" />
              </button>

              <button className="w-full flex items-center justify-between p-5 hover:bg-white/5 group transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-primary"><LinkIcon size={16} /></div>
                  <span className="text-xs font-bold text-white/90 uppercase">Linked Accounts</span>
                </div>
                <ChevronRight size={16} className="text-white/20" />
              </button>
            </CardContent>
          </Card>
        </section>

        {editing && (
          <Card className="bg-card border-border rounded-3xl p-6 space-y-4 animate-in slide-in-from-top-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase text-primary">Identity Protocol</h4>
              <Button variant="ghost" className="text-[9px] uppercase h-8" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[9px] uppercase font-black opacity-60">Legal Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-background border-border h-12 rounded-xl focus:border-primary font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] uppercase font-black opacity-60">Active Phone Contact</Label>
                <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-background border-border h-12 rounded-xl focus:border-primary font-bold" />
              </div>
              <Button 
                onClick={async () => { 
                  if (!user) return; 
                  setSaving(true); 
                  try { 
                    await updateDoc(doc(db, 'users', user.uid), { fullName, phoneNumber }); 
                    setEditing(false); 
                    toast({ title: 'Identity Synchronized' }); 
                  } finally { setSaving(false); } 
                }} 
                disabled={saving} 
                className="w-full bg-primary font-black uppercase text-[10px] h-12 rounded-xl shadow-xl shadow-primary/20"
              >
                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : 'Commit Changes'}
              </Button>
            </div>
          </Card>
        )}

        {/* System Meta Info */}
        <section className="bg-white/5 border border-white/5 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-white/30">
            <Clock size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">Session Intelligence</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold uppercase">
             <span className="text-muted-foreground">Joined HUB</span>
             <span className="text-white">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold uppercase">
             <span className="text-muted-foreground">Last Connection</span>
             <span className="text-white">{user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
          </div>
        </section>

        <Button variant="outline" onClick={handleLogout} className="w-full h-14 border-white/5 text-muted-foreground hover:text-primary font-black text-[10px] uppercase tracking-[0.2em] gap-3 rounded-2xl transition-all">
          <LogOut size={18} /> Disconnect Global Session
        </Button>
      </div>
    </div>
  );
}
