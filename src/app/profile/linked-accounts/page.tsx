'use client';

import { useRouter } from 'next/navigation';
import { 
  linkWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Link as LinkIcon, 
  Globe, 
  ChevronRight,
  ShieldCheck,
  Facebook,
  Mail,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function LinkedAccountsPage() {
  const { user, profile } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [linking, setLinking] = useState<string | null>(null);

  const isGoogleLinked = user?.providerData.some(p => p.providerId === 'google.com');

  const linkGoogle = async () => {
    if (!user) return;
    setLinking('google');
    try {
      const provider = new GoogleAuthProvider();
      await linkWithPopup(user, provider);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        authProvider: 'google.com',
        updatedAt: new Date().toISOString()
      });

      toast({ title: "Account Linked", description: "Google identity successfully synchronized." });
    } catch (error: any) {
      if (error.code === 'auth/credential-already-in-use') {
        toast({ variant: 'destructive', title: 'Already Linked', description: 'This Google account is already associated with another user.' });
      } else {
        toast({ variant: 'destructive', title: 'Link Failed', description: error.message });
      }
    } finally {
      setLinking(null);
    }
  };

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-200">
      <header className="flex items-center gap-4 py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-headline font-black tracking-tighter uppercase leading-none text-white">Linked Accounts</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Manage your connected accounts</p>
        </div>
      </header>

      <Card className="bg-card border-border rounded-none overflow-hidden shadow-2xl">
        <CardHeader className="p-8 text-center border-b border-white/5 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="h-16 w-16 bg-primary/10 rounded-none flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <LinkIcon size={30} className="text-primary" />
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tighter text-white">Connected Accounts</CardTitle>
          <CardDescription className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Manage your social login methods</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            <LinkedAccountItem 
              icon={Mail}
              title="Email Login"
              description={user?.email || "Primary login method"}
              status="Connected"
              color="text-primary"
            />
            <LinkedAccountItem 
              icon={Globe}
              title="Google Account"
              description={isGoogleLinked ? "Google login enabled" : "Link your Google account"}
              status={linking === 'google' ? <Loader2 className="animate-spin h-3 w-3" /> : (isGoogleLinked ? "Connected" : "Disconnected")}
              color={isGoogleLinked ? "text-green-500" : "text-white/20"}
              onClick={!isGoogleLinked ? linkGoogle : undefined}
            />
            <LinkedAccountItem 
              icon={Facebook}
              title="Facebook Account"
              description="Facebook login service"
              status="Unavailable"
              color="text-white/20"
              disabled
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-primary/5 p-6 rounded-none border border-primary/10 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Security Note</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          Linking multiple accounts helps you recover access to your account easily. Make sure your primary email is secure before changing your linked accounts.
        </p>
      </div>
    </div>
  );
}

function LinkedAccountItem({ icon: Icon, title, description, status, color, disabled, onClick }: any) {
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-6 transition-colors group",
        disabled ? "opacity-40 grayscale cursor-not-allowed" : "hover:bg-white/5"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-none bg-white/5 flex items-center justify-center transition-transform group-active:scale-95 text-white/80">
          <Icon size={18} />
        </div>
        <div className="text-left space-y-0.5">
          <p className="text-xs font-black uppercase tracking-tight text-white/90">{title}</p>
          <p className="text-[8px] text-muted-foreground uppercase font-black">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn("text-[9px] font-black uppercase tracking-widest", color)}>{status}</span>
        {!disabled && <ChevronRight size={14} className="text-white/20" />}
      </div>
    </button>
  );
}
