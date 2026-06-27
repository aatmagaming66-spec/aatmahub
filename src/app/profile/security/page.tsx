'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteUser } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore, useAuth } from '@/firebase/provider';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Fingerprint, 
  ShieldCheck, 
  Smartphone, 
  History, 
  ChevronRight,
  ShieldAlert,
  Trash2,
  Loader2,
  KeyRound,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

export default function SecuritySettingsPage() {
  const { user, profile, initialized } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggle2FA = async (enabled: boolean) => {
    if (!user) return;
    setUpdating(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        is2FAEnabled: enabled,
        updatedAt: new Date().toISOString()
      });
      toast({ 
        title: enabled ? "2FA Enabled" : "2FA Disabled", 
        description: `Your security settings have been updated.` 
      });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // 1. Delete Firestore User Doc
      await deleteDoc(doc(db, 'users', user.uid));
      // 2. Delete Firestore Wallet
      await deleteDoc(doc(db, 'wallets', user.uid));
      // 3. Delete Auth User
      await deleteUser(user);
      
      toast({ title: "Account Deleted", description: "Your data has been permanently removed." });
      router.replace('/login');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast({ variant: 'destructive', title: 'Action Required', description: 'Please logout and log back in to verify your identity before deleting.' });
      } else {
        toast({ variant: 'destructive', title: 'Failed', description: error.message });
      }
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
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
          <h1 className="text-2xl font-headline font-black tracking-tighter uppercase leading-none">Security Settings</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Manage your account security</p>
        </div>
      </header>

      <Card className="bg-card border-border rounded-none overflow-hidden shadow-2xl">
        <CardHeader className="p-8 text-center border-b border-white/5 bg-gradient-to-b from-accent/5 to-transparent">
          <div className="h-16 w-16 bg-accent/10 rounded-none flex items-center justify-center mx-auto mb-4 border border-accent/20">
            <Fingerprint size={30} className="text-accent" />
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tighter text-white">Security Overview</CardTitle>
          <CardDescription className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Manage your authentication and login sessions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            <div className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-none bg-white/5 flex items-center justify-center text-white/80">
                  <KeyRound size={18} />
                </div>
                <div className="text-left space-y-0.5">
                  <Label className="text-xs font-black uppercase tracking-tight text-white/90">Two-Factor Authentication</Label>
                  <p className="text-[8px] text-muted-foreground uppercase font-black">Requires a 6-digit code for every login</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {updating ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : (
                  <Switch 
                    checked={profile?.is2FAEnabled || false} 
                    onCheckedChange={toggle2FA}
                    className="data-[state=checked]:bg-accent"
                  />
                )}
              </div>
            </div>

            <SecurityActionItem 
              icon={Smartphone}
              title="Login Method"
              description={profile?.authProvider === 'google.com' ? "Logged in via Google" : "Logged in via Email/Password"}
              status={profile?.authProvider === 'google.com' ? "Google" : "Email"}
              color="text-primary"
            />
            
            <SecurityActionItem 
              icon={History}
              title="Active Logins"
              description="View and manage your active devices"
              status="Online"
              color="text-green-500"
            />

            <button 
              onClick={() => setShowDeleteDialog(true)}
              className="w-full flex items-center justify-between p-6 hover:bg-primary/5 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-none bg-primary/10 flex items-center justify-center text-primary transition-transform group-active:scale-95">
                  <Trash2 size={18} />
                </div>
                <div className="text-left space-y-0.5">
                  <p className="text-xs font-black uppercase tracking-tight text-primary">Delete Account</p>
                  <p className="text-[8px] text-muted-foreground uppercase font-black">Permanently remove your account and data</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary/50">DANGER</span>
                <ChevronRight size={14} className="text-primary/20" />
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-accent/5 p-6 rounded-none border border-accent/10 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest text-accent">Security Note</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          Enabling two-factor authentication (2FA) provides an extra layer of protection. A 6-digit verification code will be required for all future login attempts to your account.
        </p>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-card border-border rounded-none p-8 max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              This action is irreversible. All orders, credits, and profile data will be permanently purged.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-3 sm:flex-col mt-6">
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="w-full h-14 rounded-none font-black uppercase text-[11px] tracking-widest"
            >
              {deleting ? <Loader2 className="animate-spin" /> : "Purge Account Now"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="w-full h-12 rounded-none font-black uppercase text-[10px]">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SecurityActionItem({ icon: Icon, title, description, status, color, danger }: any) {
  return (
    <button className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-10 w-10 rounded-none bg-white/5 flex items-center justify-center transition-transform group-active:scale-95",
          danger ? "text-white/10" : "text-white/80"
        )}>
          <Icon size={18} />
        </div>
        <div className="text-left space-y-0.5">
          <p className={cn("text-xs font-black uppercase tracking-tight", danger ? "text-white/40" : "text-white/90")}>{title}</p>
          <p className="text-[8px] text-muted-foreground uppercase font-black">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn("text-[9px] font-black uppercase tracking-widest", color)}>{status}</span>
        <ChevronRight size={14} className="text-white/20" />
      </div>
    </button>
  );
}
