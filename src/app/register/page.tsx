'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createUserWithEmailAndPassword, 
  updateProfile as firebaseUpdateProfile, 
  GoogleAuthProvider, 
  signInWithRedirect, 
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
import { Separator } from '@/components/ui/separator';
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
  const [googleInitiating, setGoogleInitiating] = useState(false);
  
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
      toast({ variant: 'destructive', title: 'Error', description: 'Min 8 chars.' });
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
      const user = userCredential.user;
      await firebaseUpdateProfile(user, { displayName: fullName });
      
      const role = email.toLowerCase() === SUPER_ADMIN_EMAIL ? 'super_admin' : 'user';
      const profileData = {
        uid: user.uid,
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
      await setDoc(doc(db, 'users', user.uid), profileData);
      sendTelegramNotification(db, `🆕 <b>USER REG</b>\n\n👤 ${fullName}\n📧 ${email}`);
      // Redirection handled by useEffect
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: error.message });
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (googleInitiating || !initialized) return;
    setGoogleInitiating(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await setPersistence(auth, browserLocalPersistence);
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Google Signup Error:", error);
      toast({ variant: 'destructive', title: "Auth Error", description: "Could not start Google login." });
      setGoogleInitiating(false);
    }
  };

  if (!initialized || user || googleInitiating) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center gap-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-none border-t-2 border-accent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-accent/40" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Establishing Identity</p>
          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Syncing with secure vault...</p>
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
          <Button 
            variant="outline" 
            onClick={handleGoogleSignup} 
            disabled={googleInitiating || !initialized}
            className="w-full h-12 border-border bg-white/5 hover:bg-white/10 rounded-none text-[10px] font-black uppercase tracking-widest gap-3 active-press"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </Button>

          <div className="flex items-center gap-4">
            <Separator className="flex-1 bg-border" />
            <span className="text-[8px] font-black text-muted-foreground uppercase">OR</span>
            <Separator className="flex-1 bg-border" />
          </div>

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
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" className="bg-background border-border h-12 rounded-none pl-10 font-bold text-xs" />
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
              className="w-full h-16 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-none shadow-xl shadow-primary/20 mt-2 active-press group transition-all"
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
