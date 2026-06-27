'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, KeyRound, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const { user, initialized } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (initialized && user) {
      router.replace('/profile');
    }
  }, [user, initialized, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !initialized) return;
    
    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please enter your email and password.' });
      return;
    }

    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("[Login] Auth error:", error.code, error.message);
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid email or password.' });
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
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Syncing Identity</p>
          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Verifying secure browser session...</p>
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
          <CardTitle className="text-3xl font-headline font-black uppercase tracking-tighter">Login HUB</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Authorize your gaming session</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
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
                <button type="button" className="text-[9px] font-black uppercase text-primary hover:underline">Forgot?</button>
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
