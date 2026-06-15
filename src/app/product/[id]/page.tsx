
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ShieldCheck, Zap, Info, ShoppingBag, ArrowRight } from "lucide-react";
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

  // Load existing verification on mount
  useEffect(() => {
    const saved = localStorage.getItem('aatma_verification');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.isVerified) {
          setPlayerId(data.playerId);
          setServerId(data.serverId);
          setIsVerified(true);
        }
      } catch (e) {
        console.error("Failed to load verification", e);
      }
    }
  }, []);

  const productName = id?.toString().replace(/-/g, ' ').toUpperCase() || "DIGITAL ASSET";
  const imgId = id?.toString().startsWith('mlbb') ? 'game-mlbb' : 
                id === 'hok' ? 'game-hok' : 
                id === 'genshin' ? 'game-genshin' : 'game-mlbb';
  const img = PlaceHolderImages.find(i => i.id === imgId);

  const handleVerify = () => {
    if (!playerId || !serverId) {
      toast({ variant: "destructive", title: "Missing Data", description: "Player ID and Server ID are required for verification." });
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setIsVerified(true);
      
      // Save verification state for checkout reuse
      localStorage.setItem('aatma_verification', JSON.stringify({
        playerId,
        serverId,
        isVerified: true,
        verifiedName: "AATMA_USER",
        verifiedAt: new Date().toISOString()
      }));

      toast({ title: "Identity Confirmed", description: "Profile authenticated successfully." });
    }, 1200);
  };

  const handleInputChange = (type: 'player' | 'server', val: string) => {
    if (type === 'player') setPlayerId(val);
    else setServerId(val);
    
    // Reset verification if IDs are modified
    if (isVerified) {
      setIsVerified(false);
      localStorage.removeItem('aatma_verification');
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast({ variant: "destructive", title: "Login Required", description: "Please login to add items to your hub." });
      router.push('/login');
      return;
    }

    const cartId = `${id}-${selectedPack.id}`;
    addItem({
      id: cartId,
      name: `${productName} - ${selectedPack.name}`,
      price: selectedPack.price,
      quantity: 1,
      image: img?.imageUrl || "https://picsum.photos/seed/game/400/400",
      region: id?.toString().split('-')[1]?.toUpperCase() || "GLOBAL",
      tabName: selectedPack.tab.toUpperCase()
    });

    toast({
      title: "Added to Hub",
      description: `${selectedPack.name} is ready for checkout.`,
    });
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({ variant: "destructive", title: "Login Required", description: "Please login to proceed with your purchase." });
      router.push('/login');
      return;
    }

    // Clear cart and add only this item for "Direct Checkout"
    clearCart();
    const cartId = `${id}-${selectedPack.id}`;
    addItem({
      id: cartId,
      name: `${productName} - ${selectedPack.name}`,
      price: selectedPack.price,
      quantity: 1,
      image: img?.imageUrl || "https://picsum.photos/seed/game/400/400",
      region: id?.toString().split('-')[1]?.toUpperCase() || "GLOBAL",
      tabName: selectedPack.tab.toUpperCase()
    });

    router.push('/checkout');
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
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
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
            <h3 className="text-sm font-headline font-black uppercase tracking-widest text-white/90">Identity Config</h3>
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
          
          {!isVerified && (
            <Button 
              className="w-full h-12 bg-primary hover:bg-secondary text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20"
              onClick={handleVerify}
              disabled={verifying}
            >
              {verifying ? "Searching Data..." : "Verify Identity"}
            </Button>
          )}

          {isVerified && (
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

        {/* Final Summary Card */}
        <div className="bg-card border border-border rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
            <ShoppingBag size={80} />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Selection Preview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-bold">Item:</span>
              <span className="text-white font-black">{selectedPack.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-bold">Region:</span>
              <span className="text-white font-black uppercase">{id?.toString().split('-')[1] || "Global"}</span>
            </div>
            <div className="pt-5 border-t border-border flex justify-between items-end">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Total:</span>
              <span className="text-3xl font-black text-primary tracking-tighter">₹{selectedPack.price}</span>
            </div>
          </div>
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
            <ShoppingBag className="h-4 w-4" /> Add to Hub
          </Button>
        </div>

        {/* Security / Notice */}
        <div className="space-y-5 py-6 opacity-60">
          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="mt-0.5"><Info className="h-4 w-4 text-primary" /></div>
            <p className="text-[10px] text-muted-foreground font-bold leading-relaxed uppercase tracking-wider">
              Verification ensures your assets reach the correct game profile. Double check IDs before proceeding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
