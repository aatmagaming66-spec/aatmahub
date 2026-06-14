'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
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

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName,
        email,
        phoneNumber,
        role: 'user',
        createdAt: new Date().toISOString(),
      });

      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in duration-700">
      <Card className="w-full max-w-md bg-card border-border rounded-3xl shadow-2xl overflow-hidden">
        <CardHeader className="p-8 text-center space-y-2">
          <CardTitle className="text-3xl font-headline font-black uppercase tracking-tighter">Create Account</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Join AATMA HUB Premium</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
              <Input 
                placeholder="John Doe" 
                className="bg-background/50 border-border h-12 rounded-xl focus:border-primary transition-all"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</Label>
              <Input 
                placeholder="+91 1234567890" 
                className="bg-background/50 border-border h-12 rounded-xl focus:border-primary transition-all"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</Label>
              <Input 
                type="password"
                placeholder="Min 8 characters" 
                className="bg-background/50 border-border h-12 rounded-xl focus:border-primary transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confirm Password</Label>
              <Input 
                type="password"
                placeholder="Repeat password" 
                className="bg-background/50 border-border h-12 rounded-xl focus:border-primary transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-primary/20"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Join Now"}
            </Button>
          </form>
          <div className="text-center pt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Already have an account? <Link href="/login" className="text-primary hover:underline">Sign In</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
