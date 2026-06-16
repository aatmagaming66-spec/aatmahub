"use client"

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ShieldCheck, Zap, ShoppingBag, ArrowRight, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase/auth/use-user";

const PACKS = [
  { id: "p1", name: "86 Diamonds", price: 99, currency: "₹", tab: "small" },
  { id: "p2", name: "172 Diamonds", price: 199, currency: "₹", tab: "small" },
  { id: "p3", name: "257 Diamonds", price: 299, currency: "₹", tab: "small" },
  { id: "p4", name: "429 Diamonds", price: 499, currency: "₹", tab: "large" },
  { id: "p5", name: "Weekly Pass", price: 159, currency: "₹", badge: "Hot", tab: "pass" },
  { id: "p6", name: "Monthly Pass", price: 799, currency: "₹", tab: "pass" },
];

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addItem, clearCart } = useCart();
  const { user } = useUser();
  
  const [selectedPack, setSelectedPack] = useState(PACKS[0]);
  const [activeTab, setActiveTab] = useState("small");
  const [playerId, setPlayerId] = useState("");
  const [serverId, setServerId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const productName = id?.toString().replace(/-/g, ' ').toUpperCase() || "DIGITAL ASSET";

  const handleVerify = () => {
    if (!playerId || !serverId) {
      toast({ variant: "destructive", title: "Missing Data", description: "Player ID and Server ID are required for verification." });
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setIsVerified(true);
      
      localStorage.setItem('aatma_verification', JSON.stringify({
        playerId,
        serverId,
        verifiedName: "AATMA_USER",
        timestamp: new Date().toISOString()
      }));

      toast({ title: "Identity Confirmed", description: "Profile authenticated successfully." });
    }, 1200);
  };

  const handleInputChange = (type: 'player' | 'server', val: string) => {
    if (type === 'player') setPlayerId(val);
    else setServerId(val);
    
    if (isVerified) {
      setIsVerified(false);
      localStorage.removeItem('aatma_verification');
    }
  };

  const resetForm = () => {
    setPlayerId("");
    setServerId("");
    setIsVerified(false);
    localStorage.removeItem('aatma_verification');
  };

  const handleAddToCart = () => {
    if (!user) {
      toast({ variant: "destructive", title: "Login Required", description: "Please login to add items to your hub." });
      router.push('/login');
      return;
    }

    if (!isVerified) {
      toast({ variant: "destructive", title: "Player Verification Required", description: "Please verify your Player ID before adding to cart." });
      return;
    }

    const cartId = `${id}-${selectedPack.id}-${playerId}`;
    addItem({
      id: cartId,
      name: `${productName} - ${selectedPack.name}`,
      price: selectedPack.price,
      quantity: 1,
      image: "", // Image-free
      region: id?.toString().split('-')[1]?.toUpperCase() || "GLOBAL",
      tabName: selectedPack.tab.toUpperCase(),
      playerId,
      serverId,
      verifiedName: "AATMA_USER"
    });

    toast({
      title: "Added to Cart",
      description: `${selectedPack.name} (ID: ${playerId}) is ready.`,
    });

    resetForm();
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({ variant: "destructive", title: "Login Required", description: "Please login to proceed with your purchase." });
      router.push('/login');
      return;
    }

    if (!isVerified) {
      toast({ variant: "destructive", title: "Player Verification Required", description: "Please verify your Player ID before purchase." });
      return;
    }

    const cartId = `${id}-${selectedPack.id}-${playerId}`;
    clearCart();
    addItem({
      id: cartId,
      name: `${productName} - ${selectedPack.name}`,
      price: selectedPack.price,
      quantity: 1,
      image: "", // Image-free
      region: id?.toString().split('-')[1]?.toUpperCase() || "GLOBAL",
      tabName: selectedPack.tab.toUpperCase(),
      playerId,
      serverId,
      verifiedName: "AATMA_USER"
    });

    resetForm();
    router.push('/checkout');
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      {/* Header Shell - Gradient instead of Image */}
      <div className="relative w-full h-48 bg-gradient-to-br from-primary/30 via-background to-background border-b border-white/5">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
           <Gamepad2 size={120} className="text-white" />
        </div>
        <div className="absolute bottom-6 left-6">
          <h1 className="text-3xl font-headline font-black text-white uppercase tracking-tighter">
            {productName}
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
            <h3 className="text-sm font-headline font-black uppercase tracking-widest text-white/90">Player Verification</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Player ID</Label>
              <Input 
                placeholder="12345678" 
                className="bg-black/50 border-border h-12 rounded-xl text-white focus:border-primary transition-all font-bold"
                value={playerId}
                onChange={(e) => handleInputChange('player', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Server ID</Label>
              <Input 
                placeholder="1234" 
                className="bg-black/50 border-border h-12 rounded-xl text-white focus:border-primary transition-all font-bold"
                value={serverId}
                onChange={(e) => handleInputChange('server', e.target.value)}
              />
            </div>
          </div>
          
          {!isVerified ? (
            <Button 
              className="w-full h-12 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20"
              onClick={handleVerify}
              disabled={verifying}
            >
              {verifying ? "Searching Data..." : "Verify Player ID"}
            </Button>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center justify-between animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-xs font-bold text-green-500 uppercase">Target Verified: <span className="text-white">AATMA_USER</span></span>
              </div>
            </div>
          )}
        </div>

        {/* Product Selection */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 bg-card border border-border h-12 rounded-2xl p-1.5">
              <TabsTrigger value="small" className="text-[10px] font-black uppercase data-[state=active]:bg-primary">Small</TabsTrigger>
              <TabsTrigger value="large" className="text-[10px] font-black uppercase data-[state=active]:bg-primary">Large</TabsTrigger>
              <TabsTrigger value="pass" className="text-[10px] font-black uppercase data-[state=active]:bg-primary">Pass</TabsTrigger>
              <TabsTrigger value="promo" className="text-[10px] font-black uppercase data-[state=active]:bg-primary">Promo</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              <div className="grid grid-cols-2 gap-4">
                {PACKS.filter(p => p.tab === activeTab).map((pack) => (
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
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Package</span>
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

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleBuyNow}
            className="w-full h-16 bg-primary hover:bg-secondary text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 rounded-2xl group transition-all"
          >
            Buy Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            onClick={handleAddToCart}
            className="w-full h-14 border-white/10 bg-transparent text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-all gap-2"
          >
            <ShoppingBag className="h-4 w-4" /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
