
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
    <div className="flex flex-col w-full animate-in fade-in duration-500">
      {/* Banner */}
      <div className="relative w-full h-48">
        <Image 
          src={img?.imageUrl || "https://picsum.photos/seed/game/800/400"} 
          alt="Product Header" 
          fill 
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h1 className="text-2xl font-headline font-bold text-white uppercase tracking-tighter">
            {id?.toString().replace('-', ' ').toUpperCase()}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
              <Zap className="h-3 w-3" /> INSTANT
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <ShieldCheck className="h-3 w-3" /> VERIFIED
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* Verification Section */}
        <div className="space-y-4 bg-card/50 p-5 rounded-2xl border border-white/5 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-1 bg-primary rounded-full" />
            <h3 className="text-xs font-headline font-bold uppercase tracking-wider">Account Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-muted-foreground uppercase">Player ID</Label>
              <Input 
                placeholder="12345678" 
                className="bg-black/30 border-white/5 h-11"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-muted-foreground uppercase">Server ID</Label>
              <Input 
                placeholder="1234" 
                className="bg-black/30 border-white/5 h-11"
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
              />
            </div>
          </div>
          <Button 
            className="w-full h-11 bg-secondary hover:bg-white/5 border border-white/10 text-xs font-bold"
            onClick={handleVerify}
            disabled={verifying}
          >
            {verifying ? "Verifying..." : "Verify Identity"}
          </Button>

          {isVerified && (
            <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center justify-between animate-in zoom-in-95">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xs font-bold text-green-500">Verified: <span className="text-white">AATMA_OFFICIAL</span></span>
              </div>
            </div>
          )}
        </div>

        {/* Product Selection */}
        <div className="space-y-4">
          <Tabs defaultValue="small" className="w-full">
            <TabsList className="grid grid-cols-4 bg-card/50 border border-white/5 h-11 rounded-xl p-1">
              <TabsTrigger value="small" className="text-[10px] font-bold uppercase">Small</TabsTrigger>
              <TabsTrigger value="large" className="text-[10px] font-bold uppercase">Large</TabsTrigger>
              <TabsTrigger value="pass" className="text-[10px] font-bold uppercase">Pass</TabsTrigger>
              <TabsTrigger value="first" className="text-[10px] font-bold uppercase">Bonus</TabsTrigger>
            </TabsList>
            
            <TabsContent value="small" className="mt-4">
              <div className="grid grid-cols-2 gap-3">
                {PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => setSelectedPack(pack)}
                    className={cn(
                      "relative p-4 rounded-2xl border transition-all text-left group",
                      selectedPack.id === pack.id 
                        ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(161,64,255,0.1)]" 
                        : "bg-card border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none">Package</span>
                      <span className="text-sm font-bold text-white">{pack.name}</span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-0.5">
                      <span className="text-sm font-black text-primary">{pack.currency}{pack.price}</span>
                    </div>
                    {pack.badge && (
                      <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                        {pack.badge}
                      </span>
                    )}
                    {selectedPack.id === pack.id && (
                      <CheckCircle2 className="absolute bottom-3 right-3 h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Order Summary */}
        <div className="bg-card/50 border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-xs font-headline font-bold uppercase tracking-wider text-muted-foreground mb-2">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Selected Product:</span>
              <span className="text-white font-bold">{selectedPack.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Wallet Balance:</span>
              <span className="text-white font-bold">₹0.00</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Payment Method:</span>
              <span className="text-primary font-black uppercase tracking-widest">UPI Gateway</span>
            </div>
            <div className="pt-3 border-t border-white/5 flex justify-between items-end">
              <span className="text-xs font-bold text-muted-foreground">Total Payment:</span>
              <span className="text-xl font-black text-white">{selectedPack.currency}{selectedPack.price}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20">
            Buy Now
          </Button>
          <Button variant="outline" className="w-full h-12 border-white/10 bg-transparent text-xs font-bold uppercase tracking-widest">
            Add to Cart
          </Button>
        </div>

        {/* Info/Trust Section */}
        <div className="space-y-4 py-4 opacity-70">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 bg-primary/10 rounded-lg"><Info className="h-4 w-4 text-primary" /></div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Please double check your Player ID and Server ID. We are not responsible for diamonds sent to the wrong account.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
               <ShieldCheck className="h-4 w-4 text-primary" /> SECURE PAY
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
               <Zap className="h-4 w-4 text-accent" /> FAST DELIVERY
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
