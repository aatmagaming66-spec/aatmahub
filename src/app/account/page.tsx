
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
  LogIn
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const menuItems = [
    { label: "Edit Profile", icon: User, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Wallet Management", icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
    { label: "Security & Privacy", icon: ShieldCheck, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "App Settings", icon: Settings, color: "text-accent", bg: "bg-accent/10" },
    { label: "Help Center", icon: HelpCircle, color: "text-orange-400", bg: "bg-orange-400/10" },
  ];

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-500">
      {/* Header Profile */}
      <div className="p-6 bg-gradient-to-b from-primary/10 to-transparent border-b border-white/5">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary shadow-xl shadow-primary/20">
            <AvatarImage src="https://picsum.photos/seed/user-aatma/100/100" />
            <AvatarFallback className="bg-primary text-white font-black">AH</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-headline font-bold">AATMA OFFICIAL</h2>
            <p className="text-xs font-bold text-muted-foreground">aatma.official@hub.com</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Premium Member</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Auth Section for Logged Out (Visual Only) */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <Button variant="outline" className="h-12 border-white/10 bg-card hover:bg-white/5 text-[11px] font-bold uppercase tracking-widest gap-2">
            <LogIn size={16} /> Login
          </Button>
          <Button className="h-12 bg-primary hover:bg-primary/90 text-[11px] font-bold uppercase tracking-widest gap-2">
            <UserPlus size={16} /> Register
          </Button>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <button 
              key={i} 
              className="w-full bg-card border border-white/5 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 ${item.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <span className="text-sm font-bold text-foreground">{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <Button 
          variant="ghost" 
          className="w-full h-14 text-destructive hover:text-destructive hover:bg-destructive/10 font-black text-xs uppercase tracking-widest gap-2"
        >
          <LogOut size={16} /> Logout Account
        </Button>

        {/* Info Box */}
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Current Version</p>
          <p className="text-[10px] text-primary font-black">AATMA HUB v2.4.0 Stable</p>
        </div>
      </div>
    </div>
  );
}
