'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, Phone, Mail, Calendar, Crown, Shield, Loader2, Wallet, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

  // Fetch Wallet Balance - Audit Path wallets/{userId}
  const walletRef = useMemo(() => user ? doc(db, 'wallets', user.uid) : null, [user, db]);
  const { data: wallet } = useDoc(walletRef);

  useEffect(() => {
    if (user) {
      console.log('[Profile Audit] UID:', user.uid);
      console.log('[Profile Audit] Wallet Source:', `wallets/${user.uid}`);
    }
  }, [user]);

  // Route Protection: Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  // Sync state with profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhoneNumber(profile.phoneNumber || '');
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully logged out of AATMA HUB.",
      });
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
        toast({
          title: "Profile Updated",
          description: "Your account details have been successfully synchronized.",
        });
        setEditing(false);
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: updateData
        }));
      })
      .finally(() => {
        setSaving(false);
      });
  };

  if (userLoading || !user) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <div className="animate-pulse text-primary font-black uppercase tracking-widest text-[10px]">Verifying Session...</div>
      </div>
    </div>
  );

  const isSuperAdmin = profile?.role === 'super_admin';
  const isAdmin = profile?.role === 'admin' || isSuperAdmin;

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      <div className="p-8 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent border-b border-border">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className={`absolute inset-0 ${isSuperAdmin ? 'bg-primary/50' : (isAdmin ? 'bg-accent/40' : 'bg-primary/30')} rounded-full blur-xl transition-colors`} />
            <Avatar className={`h-20 w-20 border-4 ${isSuperAdmin ? 'border-primary' : (isAdmin ? 'border-accent' : 'border-primary')} shadow-2xl relative z-10`}>
              <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100/100`} />
              <AvatarFallback className={`${isSuperAdmin ? 'bg-primary' : (isAdmin ? 'bg-accent' : 'bg-primary')} text-white font-black text-xl`}>
                {fullName.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 z-20 ${isSuperAdmin ? 'bg-primary' : (isAdmin ? 'bg-accent' : 'bg-primary')} p-1.5 rounded-full border-2 border-background shadow-lg`}>
              {isSuperAdmin ? <Zap className="h-3 w-3 text-white" /> : (isAdmin ? <ShieldCheck className="h-3 w-3 text-white" /> : <Crown className="h-3 w-3 text-white" />)}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-headline font-black tracking-tighter uppercase leading-none mb-1">
              {profile?.fullName || 'Aatma Member'}
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              HUB ID: {user.uid.substring(0, 10).toUpperCase()}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className={`${isSuperAdmin ? 'bg-primary text-white border-primary' : (isAdmin ? 'bg-accent/20 text-accent border-accent/20' : 'bg-primary/20 text-primary border-primary/20')} text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border`}>
                {profile?.role?.replace('_', ' ') || 'User'} Member
              </span>
              {isAdmin && (
                 <Link href="/admin">
                   <Button variant="outline" className={`h-6 px-3 text-[8px] font-black uppercase tracking-tighter hover:bg-white/5 transition-all ${isSuperAdmin ? 'border-primary/40 text-primary' : 'border-accent/40 text-accent'}`}>
                     Access Admin Panel
                   </Button>
                 </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Wallet Quick Access */}
        <Link href="/wallet">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 rounded-3xl p-6 flex items-center justify-between group active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                <Wallet className="text-primary h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Wallet Balance</p>
                <p className="text-2xl font-black text-white">₹{wallet?.balance?.toLocaleString() || '0'}.00</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
          </Card>
        </Link>

        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="p-6 border-b border-border">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-headline font-black uppercase tracking-widest">Hub Identity</CardTitle>
              <Button 
                variant="ghost" 
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10"
                onClick={() => setEditing(!editing)}
              >
                {editing ? "Discard" : "Modify Details"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Legal Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input 
                    disabled={!editing}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 bg-background/50 border-border h-12 rounded-xl focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registered Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    disabled
                    value={profile?.email || user.email || ''}
                    className="pl-10 bg-background/20 border-border h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Primary Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input 
                    disabled={!editing}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="pl-10 bg-background/50 border-border h-12 rounded-xl focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <div className="flex-1 space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registry Date</Label>
                  <div className="flex items-center gap-2 text-xs font-bold px-3 h-10 bg-background/20 rounded-xl border border-border">
                    <Calendar className="h-3 w-3 text-accent" />
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Active Member'}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Status</Label>
                  <div className="flex items-center gap-2 text-xs font-bold px-3 h-10 bg-background/20 rounded-xl border border-border">
                    <Shield className="h-3 w-3 text-green-400" />
                    Verified
                  </div>
                </div>
              </div>
            </div>

            {editing && (
              <Button 
                onClick={handleUpdate}
                disabled={saving}
                className="w-full mt-6 h-12 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-xl"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Synchronizing...
                  </>
                ) : "Confirm Changes"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full h-14 border-primary/20 text-primary hover:bg-primary/5 font-black text-[12px] uppercase tracking-[0.3em] gap-3 rounded-2xl transition-all"
        >
          <LogOut size={20} /> Terminate Current Session
        </Button>
      </div>
    </div>
  );
}
