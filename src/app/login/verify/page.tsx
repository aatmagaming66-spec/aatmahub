'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert, Loader2, KeyRound, RefreshCcw } from 'lucide-react';

export default function Verify2FAPage() {
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    const pendingUid = sessionStorage.getItem('pending_2fa_uid');
    if (!pendingUid) {
      router.replace('/login');
    } else {
      setUid(pendingUid);
    }
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !uid) return;

    setVerifying(true);
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      
      if (!userSnap.exists()) throw new Error('User registry not found.');
      
      const profile = userSnap.data();
      
      // Check if OTP matches
      if (code === profile?.twoFactorSecret) {
        // Check if OTP has expired
        const expiry = profile.twoFactorExpiry ? new Date(profile.twoFactorExpiry) : null;
        const now = new Date();
        
        if (expiry && now > expiry) {
          throw new Error('Verification code has expired. Please request a new one.');
        }

        // OTP Valid: Clear secret and complete login
        await updateDoc(userDocRef, {
          twoFactorSecret: null,
          twoFactorExpiry: null
        });

        sessionStorage.removeItem('pending_2fa_uid');
        toast({ title: "Authorized", description: "Identity confirmed via 2FA." });
        router.push('/profile');
      } else {
        throw new Error('Invalid verification code.');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Verification Failed', description: error.message });
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!uid) return;
    setVerifying(true);
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 5);

      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        twoFactorSecret: otp,
        twoFactorExpiry: expiry.toISOString()
      });

      console.log(`[SECURITY] RESENT 2FA OTP: ${otp}`);
      toast({ title: "Code Sent", description: "A new security code has been generated." });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Resend Failed', description: e.message });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border rounded-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <CardHeader className="p-8 text-center space-y-2 border-b border-white/5">
          <div className="h-16 w-16 bg-accent/10 rounded-none flex items-center justify-center mx-auto mb-4 border border-accent/20">
            <KeyRound size={30} className="text-accent" />
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tighter">Security Challenge</CardTitle>
          <CardDescription className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Two-Factor Authentication is active</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block text-center">Enter 6-Digit Code</Label>
              <Input 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="bg-black/50 border-border h-16 rounded-none text-center text-2xl font-black tracking-[0.5em] focus:border-accent"
                autoFocus
              />
              <p className="text-[8px] text-muted-foreground uppercase text-center font-black">Check your email for the code</p>
            </div>

            <Button 
              type="submit" 
              disabled={verifying || code.length < 6}
              className="w-full h-14 bg-accent hover:bg-accent/80 text-[11px] font-black uppercase tracking-[0.2em] rounded-none transition-all shadow-xl shadow-accent/20"
            >
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Identity"}
            </Button>
          </form>

          <div className="flex flex-col items-center gap-3">
            <button 
              onClick={handleResend}
              disabled={verifying}
              className="text-[9px] font-black uppercase text-muted-foreground hover:text-white transition-colors flex items-center gap-2"
            >
              <RefreshCcw size={10} className={verifying ? "animate-spin" : ""} /> Resend OTP Code
            </button>
            <button onClick={() => router.replace('/login')} className="text-[9px] font-black uppercase text-primary hover:underline">
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
