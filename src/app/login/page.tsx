'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult,
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, KeyRound, Mail, ArrowRight } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const { user, initialized } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthSuccess = useCallback(async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      
      // Ensure profile exists for Google/New users
      if (!userSnap.exists()) {
        const currentUser = auth.currentUser;
        await setDoc(userDocRef, {
          uid,
          fullName: currentUser?.displayName || 'Member',
          email: currentUser?.email || '',
          role: 'user',
          lifetimeSpend: 0,
          currentRank: 'Warrior',
          rankId: 'warrior',
          createdAt: new Date().toISOString(),
          authProvider: currentUser?.providerData[0]?.providerId || 'google.com'
        });
      }

      const profile = (await getDoc(userDocRef)).data();

      if (profile?.is2FAEnabled) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 5);

        await updateDoc(userDocRef, {
          twoFactorSecret: otp,
          twoFactorExpiry: expiry.toISOString()
        });

        sessionStorage.setItem('pending_2fa_uid', uid);
        toast({ title: "Verification Required", description: "A security code has been sent to your email." });
        router.push('/login/verify');
      } else {
        router.push('/profile');
      }
    } catch (e) {
      console.error("Auth success processing error:", e);
      router.push('/profile');
    }
  }, [auth, db, router, toast]);

  // Handle Redirection Result
  useEffect(() => {
    if (!initialized) return;

    const checkRedirect = async () => {
      try {
        setGoogleLoading(true);
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await handleAuthSuccess(result.user.uid);
        }
      } catch (error: any) {
        console.error("Redirect Result Error:", error);
        if (error.code !== 'auth/no-auth-event') {
          toast({ variant: 'destructive', title: "Auth Error", description: "Authentication failed. Please try again." });
        }
      } finally {
        setGoogleLoading(false);
      }
    };

    checkRedirect();
  }, [auth, initialized, handleAuthSuccess, toast]);

  useEffect(() => {
    if (initialized && user && !googleLoading) {
      router.replace('/profile');
    }
  }, [user, initialized, router, googleLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !initialized) return;
    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Error', description: 'Enter credentials.' });
      return;
    }

    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleAuthSuccess(result.user.uid);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid email or password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading || !initialized) return;
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await setPersistence(auth, browserLocalPersistence);
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Google Login Initiation Error:", error);
      toast({ variant: 'destructive', title: "Auth Error", description: "Could not start Google login." });
      setGoogleLoading(false);
    }
  };

  if (initialized && user && !googleLoading) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Session...</p>
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
          <CardTitle className="text-3xl font-headline font-black uppercase tracking-tighter">Login HUB</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Authorize your gaming session</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <Button 
            variant="outline" 
            onClick={handleGoogleLogin} 
            disabled={googleLoading || !initialized}
            className="w-full h-12 border-border bg-white/5 hover:bg-white/10 rounded-none text-[10px] font-black uppercase tracking-widest gap-3 active-press"
          >
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="flex items-center gap-4">
            <Separator className="flex-1 bg-border" />
            <span className="text-[8px] font-black text-muted-foreground uppercase">OR</span>
            <Separator className="flex-1 bg-border" />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input 
                  type="email"
                  placeholder="name@email.com" 
                  className="bg-background border-border h-14 rounded-none pl-12 focus:border-primary font-bold text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                <Link href="#" className="text-[9px] font-black uppercase text-primary hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  className="bg-background border-border h-14 rounded-none pl-12 focus:border-primary font-bold text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox id="remember" className="border-border data-[state=checked]:bg-primary rounded-none" />
              <label htmlFor="remember" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer">Remember my session</label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-none transition-all shadow-xl shadow-primary/20 group"
              disabled={loading || !initialized}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <>Login to HUB <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" /></>}
            </Button>
          </form>
          <div className="text-center pt-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              New to Aatma HUB? <Link href="/register" className="text-primary hover:underline ml-1">Create Account</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
