"use client"

import { 
  User, 
  Wallet, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  HelpCircle, 
  ChevronRight,
  UserPlus,
  LogIn,
  Crown
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const menuItems = [
    { label: "Profile Details", icon: User, color: "text-primary", bg: "bg-primary/10" },
    { label: "Payment Methods", icon: Wallet, color: "text-accent", bg: "bg-accent/10" },
    { label: "Two-Factor Auth", icon: ShieldCheck, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "System Preferences", icon: Settings, color: "text-white", bg: "bg-white/10" },
    { label: "Support Ticket", icon: HelpCircle, color: "text-orange-400", bg: "bg-orange-400/10" },
  ];

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      {/* Header Profile */}
      <div className="p-8 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent border-b border-border">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl group-hover:bg-accent/30 transition-colors" />
            <Avatar className="h-20 w-20 border-4 border-primary shadow-2xl relative z-10 transition-transform hover:scale-105">
              <AvatarImage src="https://picsum.photos/seed/user-aatma/100/100" />
              <AvatarFallback className="bg-primary text-white font-black text-xl">AH</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 z-20 bg-accent p-1.5 rounded-full border-2 border-background shadow-lg">
              <Crown className="h-3 w-3 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-headline font-black tracking-tighter uppercase leading-none mb-1">Aatma Official</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">ID: HUB_9921_X</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="bg-primary/20 text-primary text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20 shadow-[0_0_10px_rgba(220,38,38,0.1)]">Elite Member</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Auth Section */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-14 border-border bg-card hover:bg-white/5 hover:border-accent/30 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl gap-2 transition-all">
            <LogIn size={18} /> Sign In
          </Button>
          <Button className="h-14 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl gap-2 transition-all shadow-xl shadow-primary/20">
            <UserPlus size={18} /> Join Now
          </Button>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 px-2">Account Control</h3>
          <div className="space-y-3">
            {menuItems.map((item, i) => (
              <button 
                key={i} 
                className="w-full bg-card border border-border p-5 rounded-3xl flex items-center justify-between group active:scale-[0.98] transition-all hover:border-accent/30 hover:bg-white/5 shadow-lg"
              >
                <div className="flex items-center gap-5">
                  <div className={`h-12 w-12 ${item.bg} rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-inner`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <span className="text-sm font-black text-foreground uppercase tracking-tight">{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <Button 
          variant="ghost" 
          className="w-full h-16 text-primary hover:text-white hover:bg-primary/20 font-black text-[12px] uppercase tracking-[0.3em] gap-3 rounded-2xl border border-transparent hover:border-primary/30 transition-all"
        >
          <LogOut size={20} /> Terminate Session
        </Button>

        {/* Info Box */}
        <div className="p-6 bg-card rounded-3xl border border-border text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-2 opacity-50">Hub Core Distribution</p>
          <p className="text-xs text-white font-black uppercase tracking-widest">Version v2.4.0 <span className="text-accent">Stable</span></p>
        </div>
      </div>
    </div>
  );
}