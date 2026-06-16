'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (!userLoading && user) {
      router.push('/profile');
    }
  }, [user, userLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Error', description: 'Email and password are required.' });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Access Granted",
        description: "Welcome back to AATMA HUB Premium.",
      });
      router.push('/');
    } catch (error: any) {
      console.error('Login Error:', error.message);
      toast({ 
        variant: 'destructive', 
        title: 'Login Failed', 
        description: error.message || 'The credentials provided do not match our records.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in duration-700">
      <Card className="w-full max-w-md bg-card border-border rounded-3xl shadow-2xl overflow-hidden">
        <CardHeader className="p-8 text-center space-y-2">
          <CardTitle className="text-3xl font-headline font-black uppercase tracking-tighter">Welcome Back</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Authenticate to AATMA HUB</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          {userLoading ? (
            <div className="space-y-6">
               <div className="space-y-2">
                 <Skeleton className="h-4 w-20 bg-white/5" />
                 <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
               </div>
               <div className="space-y-2">
                 <Skeleton className="h-4 w-20 bg-white/5" />
                 <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
               </div>
               <Skeleton className="h-14 w-full rounded-2xl bg-white/5" />
            </div>
          ) : (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                  <Input 
                    type="email"
                    placeholder="john@example.com" 
                    className="bg-background/50 border-border h-12 rounded-xl focus:border-primary transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                  <Input 
                    type="password"
                    placeholder="Your password" 
                    className="bg-background/50 border-border h-12 rounded-xl focus:border-primary transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-primary/20"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : "Sign In"}
                </Button>
              </form>
              <div className="text-center pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Don't have an account? <Link href="/register" className="text-primary hover:underline">Join Now</Link>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
