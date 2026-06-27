
'use client';

import { ShieldAlert, Info, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function PaymentSettingsPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-none hover:bg-white/5"><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Gateway Protocol</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Automated Payment Management</p>
        </div>
      </header>

      <Card className="bg-card border-border rounded-none overflow-hidden shadow-2xl border-primary/20">
        <CardHeader className="p-8 border-b border-border bg-primary/5">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
            <ShieldAlert className="h-4 w-4" /> System Suspension
          </CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center space-y-6">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border-2 border-primary/20">
            <ShieldAlert size={40} className="text-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-tighter">Automated Gateways Decommissioned</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest max-w-md mx-auto leading-relaxed">
              By administrative request, all automated payment gateway integrations (UPI/PhonePe) have been removed from the platform logic.
            </p>
          </div>
          
          <div className="bg-black/40 border border-white/5 p-6 rounded-none text-left space-y-4 max-w-lg mx-auto">
            <div className="flex items-center gap-2 text-white/40">
              <Info size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Instructional Note</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold leading-relaxed">
              To recharge users manually, navigate to the <span className="text-primary">Wallet Management</span> sector and use the "Adjust Balance" tool. Users will now be redirected to support for payment confirmation.
            </p>
          </div>

          <Button 
            onClick={() => router.push('/admin/wallet')}
            className="bg-primary h-14 px-10 rounded-none font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20"
          >
            Go to Wallet Management
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
