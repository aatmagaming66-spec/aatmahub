
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, Phone, Mail, Calendar, Crown, Shield } from 'lucide-react';

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

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setPhoneNumber(profile.phoneNumber || '');
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'Session terminated successfully.' });
      router.push('/login');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to logout.' });
    }
  };

  const handleUpdate = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        fullName,
        phoneNumber,
      });
      toast({ title: 'Success', description: 'Profile updated successfully!' });
      setEditing(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || !user) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-pulse text-primary font-black uppercase tracking-widest">Loading Session...</div>
    </div>
  );

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      <div className="p-8 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent border-b border-border">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl transition-colors" />
            <Avatar className="h-20 w-20 border-4 border-primary shadow-2xl relative z-10">
              <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100/100`} />
              <AvatarFallback className="bg-primary text-white font-black text-xl">
                {profile?.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 z-20 bg-accent p-1.5 rounded-full border-2 border-background shadow-lg">
              <Crown className="h-3 w-3 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-headline font-black tracking-tighter uppercase leading-none mb-1">
              {profile?.fullName || 'Aatma Member'}
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              ID: {user.uid.substring(0, 10).toUpperCase()}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="bg-primary/20 text-primary text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
                {profile?.role.replace('_', ' ')} Member
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="p-6 border-b border-border">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-headline font-black uppercase tracking-widest">Account Details</CardTitle>
              <Button 
                variant="ghost" 
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10"
                onClick={() => setEditing(!editing)}
              >
                {editing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
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
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    disabled
                    value={profile?.email || ''}
                    className="pl-10 bg-background/20 border-border h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input 
                    disabled={!editing}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10 bg-background/50 border-border h-12 rounded-xl focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <div className="flex-1 space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Joined</Label>
                  <div className="flex items-center gap-2 text-xs font-bold px-3 h-10 bg-background/20 rounded-xl border border-border">
                    <Calendar className="h-3 w-3 text-accent" />
                    {profile ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-2 text-xs font-bold px-3 h-10 bg-background/20 rounded-xl border border-border">
                    <Shield className="h-3 w-3 text-green-400" />
                    Active
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
                {saving ? "Saving Changes..." : "Save Profile"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full h-14 border-primary/20 text-primary hover:bg-primary/5 font-black text-[12px] uppercase tracking-[0.3em] gap-3 rounded-2xl transition-all"
        >
          <LogOut size={20} /> Terminate Session
        </Button>
      </div>
    </div>
  );
}
