'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc } from 'firebase/firestore';

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

  const handleAuthSuccess = async (uid: string) => {
    // Check for 2FA status in Firestore immediately upon login
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      const profile = userDoc.exists() ? userDoc.data() : null;

      if (profile?.is2FAEnabled) {
        sessionStorage.setItem('pending_2fa_uid', uid);
        router.push('/login/verify');
      } else {
        router.push('/profile');
      }
    } catch (e) {
      router.push('/profile');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Error', description: 'Enter credentials.' });
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleAuthSuccess(result.user.uid);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid email or password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    // Force select account to ensure smooth domain auth
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      const result = await signInWithPopup(auth, provider);
      toast({ title: "Authorized", description: `Signed in as ${result.user.displayName}` });
      await handleAuthSuccess(result.user.uid);
    } catch (error: any) {
      console.error('Google Login Error:', error);
      let msg = "Google Login Failed.";
      if (error.code === 'auth/unauthorized-domain') {
        msg = "Domain not authorized in Firebase Console.";
      }
      toast({ variant: 'destructive', title: 'Auth Error', description: msg });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      <Card className="w-full max-w-md bg-card border-border rounded-none shadow-2xl overflow-hidden">
        <CardHeader className="p-8 text-center space-y-2">
          <CardTitle className="text-3xl font-headline font-black uppercase tracking-tighter">Login</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          {initialized && user ? (
            <div className="text-center py-10 space-y-6 animate-in zoom-in-95">
               <div className="h-20 w-20 bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
                  <ShieldCheck size={40} className="text-primary" />
               </div>
               <div className="space-y-1">
                 <p className="text-sm font-black uppercase text-white">Active Session Detected</p>
                 <p className="text-[10px] text-muted-foreground uppercase tracking-widest">You are already logged in.</p>
               </div>
               <Link href="/profile" className="block">
                  <Button className="w-full h-14 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-none gap-2">
                    Go to Dashboard <ArrowRight size={14} />
                  </Button>
               </Link>
            </div>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleGoogleLogin} 
                disabled={googleLoading || !initialized}
                className="w-full h-12 border-border bg-white/5 hover:bg-white/10 rounded-none text-[10px] font-black uppercase tracking-widest gap-3"
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

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</Label>
                  {!initialized ? <Skeleton className="h-12 w-full bg-white/5" /> : (
                    <Input 
                      type="email"
                      placeholder="Email" 
                      className="bg-background/50 border-border h-12 rounded-none focus:border-primary transition-all font-bold"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                  {!initialized ? <Skeleton className="h-12 w-full bg-white/5" /> : (
                    <Input 
                      type="password"
                      placeholder="Password" 
                      className="bg-background/50 border-border h-12 rounded-none focus:border-primary transition-all font-bold"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-none transition-all shadow-xl shadow-primary/20"
                  disabled={loading || !initialized}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
                </Button>
              </form>
              <div className="text-center pt-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Don't have an account? <Link href="/register" className="text-primary hover:underline">Sign Up</Link>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
