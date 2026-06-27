'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createUserWithEmailAndPassword, 
  updateProfile as firebaseUpdateProfile, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { sendTelegramNotification } from '@/lib/telegram';
import { Loader2, UserPlus, User, Mail, Smartphone, KeyRound, ArrowRight } from 'lucide-react';

const SUPER_ADMIN_EMAIL = 'aatmagaming66@gmail.com';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const { user, initialized } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (initialized && user) {
      router.replace('/profile');
    }
  }, [user, initialized, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !initialized) return;
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Fill all fields.' });
      return;
    }
    if (password.length < 8) {
      toast({ variant: 'destructive', title: 'Error', description: 'Min 8 characters.' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Passwords mismatch.' });
      return;
    }

    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      await firebaseUpdateProfile(newUser, { displayName: fullName });
      
      const role = email.toLowerCase() === SUPER_ADMIN_EMAIL ? 'super_admin' : 'user';
      const profileData = {
        uid: newUser.uid,
        fullName,
        email,
        phoneNumber,
        role: role,
        authProvider: 'password',
        is2FAEnabled: false,
        lifetimeSpend: 0,
        currentRank: 'Warrior',
        rankId: 'warrior',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', newUser.uid), profileData);
      sendTelegramNotification(db, `🆕 <b>USER REG</b>\n\n👤 ${fullName}\n📧 ${email}`);
    } catch (error: any) {
      console.error("[Register] Error:", error.code, error.message);
      toast({ variant: 'destructive', title: 'Registration Failed', description: error.message });
      setLoading(false);
    }
  };

  if (!initialized || user) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center gap-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="h-16 w-16 rounded-none border-t-2 border-accent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-accent/40" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Establishing Identity</p>
          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Synchronizing with secure cloud vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in duration-700 pb-24">
      <Card className="w-full max-w-lg bg-card border-border rounded-none shadow-2xl overflow-hidden">
        <CardHeader className="p-8 text-center space-y-2 border-b border-white/5">
          <div className="h-12 w-12 bg-accent/10 rounded-none flex items-center justify-center mx-auto mb-2 border border-accent/20">
             <UserPlus className="h-6 w-6 text-accent" />
          </div>
          <CardTitle className="text-3xl font-headline font-black uppercase tracking-tighter">Sign Up</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Join the elite gaming community</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="bg-background border-border h-12 rounded-none pl-10 font-bold text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                  <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+91..." className="bg-background border-border h-12 rounded-none pl-10 font-bold text-xs" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" className="bg-background border-border h-12 rounded-none pl-10 font-bold text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Create Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars" className="bg-background border-border h-12 rounded-none pl-10 font-bold text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Repeat Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="bg-background border-border h-12 rounded-none pl-10 font-bold text-xs" />
                </div>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={loading || !initialized} 
              className="w-full h-16 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-none shadow-xl shadow-primary/20 mt-2 group transition-all"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Account <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" /></>}
            </Button>
          </form>
          <div className="text-center pt-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Already a member? <Link href="/login" className="text-primary hover:underline ml-1">Sign In</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
