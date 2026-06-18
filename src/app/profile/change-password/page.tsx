'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Loader2, 
  Key, 
  ShieldCheck, 
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.email) {
      toast({ variant: 'destructive', title: 'Session Lost', description: 'Please log in again to continue.' });
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'All fields are required.' });
      return;
    }

    if (newPassword.length < 8) {
      toast({ variant: 'destructive', title: 'Error', description: 'New password must be at least 8 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      toast({
        title: "Success",
        description: "Your password has been changed successfully.",
      });
      
      router.push('/profile');
    } catch (error: any) {
      console.error('Password Update Error:', error);
      let errorMessage = 'An internal system error occurred.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'The current password you entered is incorrect.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }

      toast({ 
        variant: 'destructive', 
        title: 'Update Failed', 
        description: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-200">
      <header className="flex items-center gap-4 py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-none hover:bg-white/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-headline font-black tracking-tighter uppercase leading-none">Change Password</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Update your security settings</p>
        </div>
      </header>

      <Card className="bg-card border-border rounded-none overflow-hidden shadow-2xl">
        <CardHeader className="p-8 text-center border-b border-white/5">
          <div className="h-16 w-16 bg-accent/10 rounded-none flex items-center justify-center mx-auto mb-4 border border-accent/20">
            <Key size={30} className="text-accent" />
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tighter">Update Password</CardTitle>
          <CardDescription className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Set a new secure password for your account</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2 relative">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Password</Label>
              <div className="relative">
                <Input 
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password" 
                  className="bg-black/50 border-border h-14 rounded-none focus:border-primary font-bold text-sm"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            <div className="space-y-2 relative">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Password</Label>
              <div className="relative">
                <Input 
                  type={showNew ? "text" : "password"}
                  placeholder="Minimum 8 characters" 
                  className="bg-black/50 border-border h-14 rounded-none focus:border-accent font-bold text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confirm New Password</Label>
              <Input 
                type="password"
                placeholder="Repeat new password" 
                className="bg-black/50 border-border h-14 rounded-none focus:border-accent font-bold text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-none transition-all shadow-xl shadow-primary/20 gap-2 mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} /> Change Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="bg-primary/5 p-6 rounded-none border border-primary/10 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Security Note</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          Your password is encrypted for your safety. We recommend using a unique password that you don't use on other websites.
        </p>
      </div>
    </div>
  );
}
