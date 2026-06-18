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
  Copy, 
  ChevronRight, 
  User, 
  Bell, 
  Settings,
  Shield,
  LogIn,
  Key,
  Clock,
  Link as LinkIcon,
  Fingerprint,
  Zap,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { RankAvatar } from '@/components/ui/rank-avatar';
import { getRankFromSpend } from '@/lib/ranks';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, profile, initialized, loading: authLoading } = useUser();
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
    if (profile && !editing) {
      setFullName(profile.fullName || '');
      setPhoneNumber(profile.phoneNumber || '');
    }
  }, [profile, editing]);

  const rankInfo = useMemo(() => {
    return getRankFromSpend(profile?.lifetimeSpend || 0, ranks);
  }, [profile?.lifetimeSpend, ranks]);

  const userLevel = useMemo(() => {
    if (!profile) return 1;
    return Math.floor((profile.lifetimeSpend || 0) / 2500) + 1;
  }, [profile?.lifetimeSpend]);

  const handleLogout = async () => {
    try { 
      await signOut(auth); 
      router.replace('/login'); 
    } catch (e) { 
      toast({ variant: 'destructive', title: 'Logout Failed' }); 
    }
  };

  const handleSave = async () => { 
    if (!user) return; 
    setSaving(true); 
    try { 
      await updateDoc(doc(db, 'users', user.uid), { 
        fullName, 
        phoneNumber,
        updatedAt: new Date().toISOString()
      }); 
      setEditing(false); 
      toast({ title: 'Profile Updated', description: 'Your personal information has been saved.' }); 
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally { 
      setSaving(false); 
    } 
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 pb-24">
      <div className="relative p-6 pb-8 bg-gradient-to-b from-primary/20 via-primary/5 to-background border-b border-white/5 rounded-none overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12"><Shield size={200} className="text-primary" /></div>
        
        <div className="relative z-10">
          {!initialized ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-none bg-white/5" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 bg-white/5" />
                <Skeleton className="h-4 w-24 bg-white/5" />
              </div>
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center justify-center gap-4 py-6 animate-in zoom-in-95 duration-300">
               <div className="h-16 w-16 bg-primary/10 rounded-none flex items-center justify-center border border-primary/20">
                  <User size={30} className="text-primary" />
               </div>
               <div className="text-center space-y-1">
                  <h2 className="text-xl font-headline font-black uppercase tracking-tighter">Guest User</h2>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Login required to access profile</p>
               </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <RankAvatar 
                rank={rankInfo.name} 
                size="xl" 
                className="shadow-2xl rounded-none" 
                fallback={profile?.fullName?.charAt(0)}
              />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex flex-col">
                  {!profile ? (
                    <Skeleton className="h-6 w-32 bg-white/5 mb-2" />
                  ) : (
                    <h2 className="text-xl font-headline font-black uppercase tracking-tighter leading-tight truncate text-white">{profile?.fullName || 'My Profile'}</h2>
                  )}
                  
                  {profile && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-none flex items-center gap-1">
                        <ShieldCheck size={8} className="text-white/40" />
                        <span className="text-[7px] font-black uppercase text-white/70 tracking-widest">{profile.role.replace('_', ' ')}</span>
                      </div>
                      <div className="px-2 py-0.5 bg-accent/20 border border-accent/30 rounded-none flex items-center gap-1">
                        <Zap size={8} className="text-accent" />
                        <span className="text-[7px] font-black uppercase text-accent tracking-widest">Level {userLevel}</span>
                      </div>
                      <div className="px-2 py-0.5 bg-primary/20 border border-primary/30 rounded-none flex items-center gap-1">
                        <Star size={8} className="text-primary fill-primary" />
                        <span className="text-[7px] font-black uppercase text-primary tracking-widest">{rankInfo.name} Status</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { if (user) { navigator.clipboard.writeText(user.uid); toast({ title: 'Account ID Copied' }); } }}>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                    Account ID: {user ? user.uid.substring(0, 10).toUpperCase() : '----------'}
                  </p>
                  {user && <Copy size={8} className="text-white/20 group-hover:text-primary transition-colors" />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {!initialized ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full bg-white/5" />
            <Skeleton className="h-64 w-full bg-white/5" />
          </div>
        ) : !user ? (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <Link href="/login" className="block" prefetch={false}>
              <Button className="w-full h-16 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-none shadow-xl shadow-primary/20 gap-3">
                <LogIn size={18} /> Login Now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {isAdmin && (
              <Link href="/admin" prefetch={false}>
                <Button className="w-full h-16 bg-primary font-black text-[11px] uppercase tracking-[0.2em] gap-3 rounded-none shadow-2xl group border-none">
                  <ShieldCheck size={20} /> Admin Dashboard <ArrowRight size={16} />
                </Button>
              </Link>
            )}

            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Settings size={14} className="text-primary" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">Account Settings</h3>
              </div>
              <Card className="bg-card border-border rounded-none overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  <button onClick={() => setEditing(!editing)} className="w-full flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 group transition-colors text-left">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-none bg-white/5 flex items-center justify-center text-primary"><User size={16} /></div>
                      <span className="text-xs font-bold text-white/90 uppercase">Personal Information</span>
                    </div>
                    <ChevronRight size={16} className={cn("text-white/20 transition-transform", editing && "rotate-90")} />
                  </button>

                  <Link href="/profile/change-password" prefetch={false}>
                    <div className="w-full flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 group transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-none bg-white/5 flex items-center justify-center text-accent"><Key size={16} /></div>
                        <span className="text-xs font-bold text-white/90 uppercase">Change Password</span>
                      </div>
                      <ChevronRight size={16} className="text-white/20" />
                    </div>
                  </Link>

                  <Link href="/profile/notifications" prefetch={false}>
                    <div className="w-full flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 group transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-none bg-white/5 flex items-center justify-center text-primary"><Bell size={16} /></div>
                        <span className="text-xs font-bold text-white/90 uppercase">Notifications</span>
                      </div>
                      <ChevronRight size={16} className="text-white/20" />
                    </div>
                  </Link>

                  <Link href="/profile/security" prefetch={false}>
                    <div className="w-full flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 group transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-none bg-white/5 flex items-center justify-center text-accent"><Fingerprint size={16} /></div>
                        <span className="text-xs font-bold text-white/90 uppercase">Security Settings</span>
                      </div>
                      <ChevronRight size={16} className="text-white/20" />
                    </div>
                  </Link>

                  <Link href="/profile/linked-accounts" prefetch={false}>
                    <div className="w-full flex items-center justify-between p-5 hover:bg-white/5 group transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-none bg-white/5 flex items-center justify-center text-primary"><LinkIcon size={16} /></div>
                        <span className="text-xs font-bold text-white/90 uppercase">Linked Accounts</span>
                      </div>
                      <ChevronRight size={16} className="text-white/20" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </section>

            {editing && (
              <Card className="bg-card border-border rounded-none p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase text-primary tracking-widest">Update Information</h4>
                  <button className="text-[9px] uppercase h-8 font-black text-muted-foreground" onClick={() => setEditing(false)}>Cancel</button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase font-black opacity-60">Full Name</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-background border-border h-12 rounded-none focus:border-primary font-bold text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase font-black opacity-60">Phone Number</Label>
                    <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-background border-border h-12 rounded-none focus:border-primary font-bold text-white" />
                  </div>
                  <Button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="w-full bg-primary font-black uppercase text-[10px] h-12 rounded-none shadow-xl shadow-primary/20"
                  >
                    {saving ? <Loader2 className="animate-spin h-4 w-4" /> : 'Save Changes'}
                  </Button>
                </div>
              </Card>
            )}

            <section className="bg-white/5 border border-white/5 rounded-none p-5 space-y-3">
              <div className="flex items-center gap-2 text-white/30">
                <Clock size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Account Info</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                 <span className="text-muted-foreground">Member Since</span>
                 <span className="text-white">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}</span>
              </div>
            </section>

            <Button variant="outline" onClick={handleLogout} className="w-full h-14 border-white/5 text-muted-foreground hover:text-primary font-black text-[10px] uppercase tracking-[0.2em] gap-3 rounded-none transition-all">
              <LogOut size={18} /> Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
