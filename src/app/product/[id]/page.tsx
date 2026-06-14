"use client"

import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ShieldCheck, Zap, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const PACKS = [
  { id: "p1", name: "86 Diamonds", price: 99, currency: "₹" },
  { id: "p2", name: "172 Diamonds", price: 199, currency: "₹" },
  { id: "p3", name: "257 Diamonds", price: 299, currency: "₹" },
  { id: "p4", name: "429 Diamonds", price: 499, currency: "₹" },
  { id: "p5", name: "Weekly Pass", price: 159, currency: "₹", badge: "Hot" },
  { id: "p6", name: "Monthly Pass", price: 799, currency: "₹" },
];

export default function ProductPage() {
  const { id } = useParams();
  const [selectedPack, setSelectedPack] = useState(PACKS[0]);
  const [playerId, setPlayerId] = useState("");
  const [serverId, setServerId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const imgId = id?.toString().startsWith('mlbb') ? 'game-mlbb' : 
                id === 'hok' ? 'game-hok' : 
                id === 'genshin' ? 'game-genshin' : 'game-mlbb';
  const img = PlaceHolderImages.find(i => i.id === imgId);

  const handleVerify = () => {
    if (!playerId || !serverId) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setIsVerified(true);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      {/* Banner */}
      <div className="relative w-full h-56">
        <Image 
          src={img?.imageUrl || "https://picsum.photos/seed/game/800/400"} 
          alt="Product Header" 
          fill 
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <h1 className="text-3xl font-headline font-black text-white uppercase tracking-tighter">
            {id?.toString().replace('-', ' ').toUpperCase()}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-[9px] font-black text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
              <Zap className="h-3 w-3" /> Instant Delivery
            </span>
            <span className="flex items-center gap-1 text-[9px] font-black text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3" /> Official Service
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 space-y-10">
        {/* Verification Section */}
        <div className="space-y-6 bg-card p-6 rounded-3xl border border-border shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 bg-primary rounded-full" />
            <h3 className="text-sm font-headline font-black uppercase tracking-widest">Enter Account Data</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Player ID</Label>
              <Input 
                placeholder="12345678" 
                className="bg-black/50 border-border h-12 rounded-xl text-white focus:border-primary transition-all"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Server ID</Label>
              <Input 
                placeholder="1234" 
                className="bg-black/50 border-border h-12 rounded-xl text-white focus:border-primary transition-all"
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
              />
            </div>
          </div>
          <Button 
            className="w-full h-12 bg-secondary hover:bg-white/5 border border-border text-[11px] font-black uppercase tracking-[0.2em] transition-all"
            onClick={handleVerify}
            disabled={verifying}
          >
            {verifying ? "Processing..." : "Verify Player"}
          </Button>

          {isVerified && (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center justify-between animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-xs font-bold text-green-500">Player Found: <span className="text-white">AATMA_HUB</span></span>
              </div>
            </div>
          )}
        </div>

        {/* Product Selection */}
        <div className="space-y-6">
          <Tabs defaultValue="small" className="w-full">
            <TabsList className="grid grid-cols-4 bg-card border border-border h-12 rounded-2xl p-1.5">
              <TabsTrigger value="small" className="text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white">Small</TabsTrigger>
              <TabsTrigger value="large" className="text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white">Large</TabsTrigger>
              <TabsTrigger value="pass" className="text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white">Pass</TabsTrigger>
              <TabsTrigger value="first" className="text-[10px] font-black uppercase data-[state=active]:bg-primary data-[state=active]:text-white">Promo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="small" className="mt-6">
              <div className="grid grid-cols-2 gap-4">
                {PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => setSelectedPack(pack)}
                    className={cn(
                      "relative p-5 rounded-2xl border transition-all text-left bg-card overflow-hidden group",
                      selectedPack.id === pack.id 
                        ? "border-primary shadow-[0_0_25px_rgba(220,38,38,0.15)] bg-primary/5" 
                        : "border-border hover:border-accent/30"
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Pack</span>
                      <span className="text-sm font-black text-white">{pack.name}</span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-lg font-black text-primary">{pack.currency}{pack.price}</span>
                    </div>
                    {pack.badge && (
                      <span className="absolute -top-1 -right-1 bg-accent text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tighter">
                        {pack.badge}
                      </span>
                    )}
                    {selectedPack.id === pack.id && (
                      <CheckCircle2 className="absolute bottom-4 right-4 h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Order Summary */}
        <div className="bg-card border border-border rounded-3xl p-6 space-y-5 shadow-2xl">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Final Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-bold">Selected Item:</span>
              <span className="text-white font-black">{selectedPack.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-bold">Wallet Credit:</span>
              <span className="text-white font-black">₹0.00</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-bold">Method:</span>
              <span className="text-accent font-black uppercase tracking-widest">Gateway</span>
            </div>
            <div className="pt-5 border-t border-border flex justify-between items-end">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Total Amount:</span>
              <span className="text-2xl font-black text-primary tracking-tighter">{selectedPack.currency}{selectedPack.price}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <Button className="w-full h-14 bg-primary hover:bg-secondary text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 rounded-2xl transition-all">
            Proceed to Buy
          </Button>
          <Button variant="outline" className="w-full h-14 border-accent/20 bg-transparent text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-accent/5 hover:text-accent transition-all">
            Add to Basket
          </Button>
        </div>

        {/* Info/Trust Section */}
        <div className="space-y-5 py-6 opacity-80">
          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl">
            <div className="mt-0.5 p-2 bg-primary/10 rounded-xl"><Info className="h-5 w-5 text-primary" /></div>
            <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
              Verify your Player ID and Server ID carefully. AATMA HUB is not liable for transactions made to incorrect accounts.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-widest">
               <ShieldCheck className="h-4 w-4 text-primary" /> Encrypted Pay
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-widest">
               <Zap className="h-4 w-4 text-accent" /> High Speed
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}