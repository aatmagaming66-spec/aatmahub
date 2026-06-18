'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile as firebaseUpdateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { sendTelegramNotification } from '@/lib/telegram';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Loader2, UserPlus } from 'lucide-react';

const SUPER_ADMIN_EMAIL = 'aatmagaming66@gmail.com';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'All fields are required.' });
      return;
    }

    if (password.length < 8) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 8 characters.' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
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
        createdAt: new Date().toISOString(),
      };

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, profileData);

      sendTelegramNotification(db, `🆕 <b>NEW USER REGISTERED</b>\n\n👤 <b>Name:</b> ${fullName}\n📧 <b>Email:</b> ${email}`);
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Profile creation is handled by ProfileProvider snapshot if missing, 
      // but we force update source to google here for registry accuracy
      const user = result.user;
      const userDocRef = doc(db, 'users', user.uid);
      
      await setDoc(userDocRef, {
        authProvider: 'google.com',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast({ title: "Account Active", description: "Google account linked successfully." });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Google Auth Error', description: error.message });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in duration-700">
      <Card className="w-full max-w-md bg-card border-border rounded-none shadow-2xl overflow-hidden">
        <CardHeader className="p-8 text-center space-y-2">
          <CardTitle className="text-3xl font-headline font-black uppercase tracking-tighter">Sign Up</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Create your account</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <Button 
            variant="outline" 
            onClick={handleGoogleSignup} 
            disabled={googleLoading}
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
            Sign up with Google
          </Button>

          <div className="flex items-center gap-4">
            <Separator className="flex-1 bg-border" />
            <span className="text-[8px] font-black text-muted-foreground uppercase">OR</span>
            <Separator className="flex-1 bg-border" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="bg-background/50 border-border h-12 rounded-none font-bold text-xs" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone</Label>
                <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone Number" className="bg-background/50 border-border h-12 rounded-none font-bold text-xs" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="bg-background/50 border-border h-12 rounded-none font-bold text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="bg-background/50 border-border h-12 rounded-none font-bold text-xs" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confirm</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="bg-background/50 border-border h-12 rounded-none font-bold text-xs" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-14 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-none shadow-xl shadow-primary/20 mt-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign Up"}
            </Button>
          </form>
          <div className="text-center pt-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
