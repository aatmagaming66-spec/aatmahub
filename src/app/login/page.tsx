'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, KeyRound, Mail, ArrowRight, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ variant: 'destructive', title: 'Email Required', description: 'Please enter your email address first.' });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Reset Email Sent", description: "Check your inbox for password reset instructions." });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !initialized) return;
    
    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please enter your email and password.' });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedUser = userCredential.user;

      // Check for 2FA status in Firestore
      const userDoc = await getDoc(doc(db, 'users', loggedUser.uid));
      const userData = userDoc.data();

      if (userData?.is2FAEnabled) {
        // Generate a simple 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 5);

        await updateDoc(doc(db, 'users', loggedUser.uid), {
          twoFactorSecret: otp,
          twoFactorExpiry: expiry.toISOString()
        });

        // Store temp UID for verification
        sessionStorage.setItem('pending_2fa_uid', loggedUser.uid);
        await auth.signOut(); 
        
        router.push('/login/verify');
        return;
      }

      router.push('/profile');
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Login Failed', 
        description: 'Incorrect email or password. Please try again.' 
      });
      setLoading(false);
    }
  };

  if (!initialized || user) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center gap-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="h-16 w-16 rounded-none border-t-2 border-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-primary/40" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Verifying Session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500 pb-20">
      <Card className="w-full max-w-md bg-card border-border rounded-none shadow-2xl overflow-hidden">
        <CardHeader className="p-8 text-center space-y-2 border-b border-white/5">
          <div className="h-12 w-12 bg-primary/10 rounded-none flex items-center justify-center mx-auto mb-2 border border-primary/20">
             <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline font-black uppercase tracking-tighter text-white">Login</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input 
                  type="email"
                  placeholder="name@email.com" 
                  className="bg-background border-border h-14 rounded-none pl-12 focus:border-primary font-bold text-sm text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                <button type="button" onClick={handleForgotPassword} className="text-[9px] font-black uppercase text-primary hover:underline">Forgot Password?</button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••" 
                  className="bg-background border-border h-14 rounded-none pl-12 pr-12 focus:border-primary font-bold text-sm text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-none transition-all shadow-xl shadow-primary/20 group"
              disabled={loading || !initialized}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <>Sign In <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" /></>}
            </Button>
          </form>
          <div className="text-center pt-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Don't have an account? <Link href="/register" className="text-primary hover:underline ml-1">Sign Up</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
