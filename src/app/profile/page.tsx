
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  Fingerprint,
  Zap,
  Star,
  Camera,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { RankAvatar } from '@/components/ui/rank-avatar';
import { getRankFromSpend } from '@/lib/ranks';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * AATMA HUB Simplified Profile Hub
 * Optimized for 0ms render-blocking and background hydration.
 * Refined Header with Badge Matrix.
 * Added Profile Picture management.
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
  const [photoURL, setPhotoURL] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync identity fields only when not editing to prevent overwrites
  useEffect(() => {
    if (profile && !editing) {
      setFullName(profile.fullName || '');
      setPhoneNumber(profile.phoneNumber || '');
      setPhotoURL(profile.photoURL || '');
    }
  }, [profile, editing]);

  // Prefetch routes only once when identity is established
  useEffect(() => {
    if (user) {
      router.prefetch('/profile/change-password');
      router.prefetch('/profile/notifications');
      router.prefetch('/profile/security');
      router.prefetch('/profile/linked-accounts');
    }
  }, [user, router]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Asset Restricted', description: 'Maximum file size is 1MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => { 
    if (!user) return; 
    setSaving(true); 
    try { 
      await updateDoc(doc(db, 'users', user.uid), { 
        fullName, 
        phoneNumber,
        photoURL,
        updatedAt: new Date().toISOString()
      }); 
      setEditing(false); 
      toast({ title: 'Identity Synchronized', description: 'Your profile has been updated.' }); 
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
    } finally { 
      setSaving(false); 
    } 
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-500 pb-24">
      {/* 1. SHARED GRADIENT HEADER SHELL */}
      <div className="relative p-6 pb-8 bg-gradient-to-b from-primary/20 via-primary/5 to-background border-b border-white/5 rounded-b-[2.5rem] overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12"><Shield size={200} className="text-primary" /></div>
        
        <div className="relative z-10">
          {initialized && !user ? (
            <div className="flex flex-col items-center justify-center gap-4 py-6 animate-in zoom-in-95 duration-300">
               <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <User size={30} className="text-primary" />
               </div>
               <div className="text-center space-y-1">
                  <h2 className="text-xl font-headline font-black uppercase tracking-tighter">Guest Protocol</h2>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Authentication Required</p>
               </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {!initialized ? (
                 <div className="relative"><Skeleton className="h-20 w-20 rounded-full bg-white/5" /><div className="absolute inset-0 border-2 border-white/5 rounded-full" /></div>
              ) : (
                <RankAvatar 
                  src={profile?.photoURL || `https://picsum.photos/seed/${user?.uid}/200/200`} 
                  rank={rankInfo.name} 
                  size="xl" 
                  className="shadow-2xl" 
                />
              )}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex flex-col">
                  {!initialized || !profile ? (
                    <Skeleton className="h-6 w-32 bg-white/5" />
                  ) : (
                    <h2 className="text-xl font-headline font-black uppercase tracking-tighter leading-tight truncate text-white">{profile?.fullName || 'Aatma Member'}</h2>
                  )}
                  
                  {/* Identity Badge Matrix */}
                  {profile && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md flex items-center gap-1">
                        <ShieldCheck size={8} className="text-white/40" />
                        <span className="text-[7px] font-black uppercase text-white/70 tracking-widest">{profile.role.replace('_', ' ')}</span>
                      </div>
                      <div className="px-2 py-0.5 bg-accent/20 border border-accent/30 rounded-md flex items-center gap-1">
                        <Zap size={8} className="text-accent" />
                        <span className="text-[7px] font-black uppercase text-accent tracking-widest">Level {userLevel}</span>
                      </div>
                      <div className="px-2 py-0.5 bg-primary/20 border border-primary/30 rounded-md flex items-center gap-1">
                        <Star size={8} className="text-primary fill-primary" />
                        <span className="text-[7px] font-black uppercase text-primary tracking-widest">{rankInfo.name}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { if (user) { navigator.clipboard.writeText(user.uid); toast({ title: 'ID Copied' }); } }}>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                    Hub ID: {user ? user.uid.substring(0, 10).toUpperCase() : '----------'}
                  </p>
                  {user && <Copy size={8} className="text-white/20 group-hover:text-primary transition-colors" />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. PAGE CONTENT BODY */}
      <div className="p-6 space-y-8">
        {initialized && !user ? (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <Link href="/login" className="block">
              <Button className="w-full h-16 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 gap-3">
                <LogIn size={18} /> Establish Connection
              </Button>
            </Link>
            <Link href="/register" className="block text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
                Initialize New Identity
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {isAdmin && (
              <Link href="/admin" prefetch={true}>
                <Button className="w-full h-16 bg-primary font-black text-[11px] uppercase tracking-[0.2em] gap-3 rounded-2xl shadow-2xl group border-none">
                  <ShieldCheck size={20} /> Admin Command Center <ArrowRight size={16} />
                </Button>
              </Link>
            )}

            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Settings size={14} className="text-primary" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">Account Protocols</h3>
              </div>
              <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  <button onClick={() => setEditing(!editing)} className="w-full flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 group transition-colors text-left">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-primary"><User size={16} /></div>
                      <span className="text-xs font-bold text-white/90 uppercase">Edit Profile</span>
                    </div>
                    <ChevronRight size={16} className={cn("text-white/20 transition-transform", editing && "rotate-90")} />
                  </button>

                  <Link href="/profile/change-password">
                    <div className="w-full flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 group transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-accent"><Key size={16} /></div>
                        <span className="text-xs font-bold text-white/90 uppercase">Change Password</span>
                      </div>
                      <ChevronRight size={16} className="text-white/20" />
                    </div>
                  </Link>

                  <Link href="/profile/notifications">
                    <div className="w-full flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 group transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-primary"><Bell size={16} /></div>
                        <span className="text-xs font-bold text-white/90 uppercase">Notification Settings</span>
                      </div>
                      <ChevronRight size={16} className="text-white/20" />
                    </div>
                  </Link>

                  <Link href="/profile/security">
                    <div className="w-full flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 group transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-accent"><Fingerprint size={16} /></div>
                        <span className="text-xs font-bold text-white/90 uppercase">Security Settings</span>
                      </div>
                      <ChevronRight size={16} className="text-white/20" />
                    </div>
                  </Link>

                  <Link href="/profile/linked-accounts">
                    <div className="w-full flex items-center justify-between p-5 hover:bg-white/5 group transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-primary"><LinkIcon size={16} /></div>
                        <span className="text-xs font-bold text-white/90 uppercase">Linked Accounts</span>
                      </div>
                      <ChevronRight size={16} className="text-white/20" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </section>

            {editing && (
              <Card className="bg-card border-border rounded-3xl p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase text-primary tracking-widest">Edit Identity</h4>
                  <button className="text-[9px] uppercase h-8 font-black text-muted-foreground" onClick={() => setEditing(false)}>Cancel</button>
                </div>

                {/* Profile Picture Management */}
                <div className="flex flex-col items-center gap-4 py-2 border-b border-white/5 pb-6">
                  <div className="relative group">
                    <RankAvatar 
                      src={photoURL || profile?.photoURL || `https://picsum.photos/seed/${user?.uid}/200/200`}
                      rank={rankInfo.name}
                      size="xl"
                      className="ring-4 ring-primary/20"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center shadow-xl border-2 border-card active:scale-90 transition-transform"
                    >
                      <Camera size={14} className="text-white" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 px-4 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                    >
                      <ImageIcon size={12} className="mr-1.5" /> Change Photo
                    </Button>
                    {(photoURL || profile?.photoURL) && (
                      <Button 
                        variant="ghost" 
                        onClick={() => setPhotoURL('')}
                        className="h-8 px-4 rounded-xl text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary/10"
                      >
                        <Trash2 size={12} className="mr-1.5" /> Remove
                      </Button>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp" 
                    onChange={handleFileChange} 
                  />
                  <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">JPG, PNG, WEBP (Max 1MB)</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase font-black opacity-60">Legal Full Name</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-background border-border h-12 rounded-xl focus:border-primary font-bold text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase font-black opacity-60">Active Phone Contact</Label>
                    <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-background border-border h-12 rounded-xl focus:border-primary font-bold text-white" />
                  </div>
                  <Button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="w-full bg-primary font-black uppercase text-[10px] h-12 rounded-xl shadow-xl shadow-primary/20"
                  >
                    {saving ? <Loader2 className="animate-spin h-4 w-4" /> : 'Commit Profile Changes'}
                  </Button>
                </div>
              </Card>
            )}

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
        )}
      </div>
    </div>
  );
}
