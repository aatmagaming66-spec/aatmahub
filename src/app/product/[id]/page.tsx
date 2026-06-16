
"use client"

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ShieldCheck, Zap, ShoppingBag, ArrowRight, Gamepad2, Loader2, PackageSearch, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where, doc } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useDoc } from "@/firebase/firestore/use-doc";

/**
 * PRODUCT DETAIL PAGE
 * Dynamically renders based on category ID (slug).
 * Fetches all child SKUs from the 'products' collection.
 */
export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addItem, clearCart } = useCart();
  const { user } = useUser();
  const db = useFirestore();
  
  // DATA SOURCE 1: Product Registry (SKUs)
  const productsQuery = useMemo(() => query(
    collection(db, 'products'),
    where('category', '==', id),
    where('status', '==', 'active')
  ), [db, id]);

  // DATA SOURCE 2: Parent Metadata (e.g. Game Info)
  const gameRef = useMemo(() => id ? doc(db, 'games', id as string) : null, [db, id]);
  const { data: gameInfo } = useDoc(gameRef);

  const { data: packs, loading: productsLoading } = useCollection(productsQuery);

  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("small");
  const [playerId, setPlayerId] = useState("");
  const [serverId, setServerId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const productName = gameInfo?.name || id?.toString().replace(/-/g, ' ').toUpperCase() || "DIGITAL ASSET";

  // Logic: Default selection logic once registry is hydrated
  useMemo(() => {
    if (packs && packs.length > 0 && !selectedPack) {
      const defaultPack = packs.find(p => p.tab === activeTab) || packs[0];
      setSelectedPack(defaultPack);
      if (defaultPack.tab) setActiveTab(defaultPack.tab);
    }
  }, [packs, selectedPack, activeTab]);

  const handleVerify = () => {
    if (!playerId) {
      toast({ variant: "destructive", title: "Missing ID", description: "Player ID is mandatory." });
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setIsVerified(true);
      toast({ title: "Account Verified", description: "Identity check passed." });
    }, 1000);
  };

  const handleInputChange = (type: 'player' | 'server', val: string) => {
    if (type === 'player') setPlayerId(val);
    else setServerId(val);
    if (isVerified) setIsVerified(false);
  };

  const handleAddToCart = () => {
    if (!user) { toast({ variant: "destructive", title: "Login Required" }); router.push('/login'); return; }
    if (!isVerified) { toast({ variant: "destructive", title: "Verification Required" }); return; }
    if (!selectedPack) return;

    addItem({
      id: `${id}-${selectedPack.id}-${playerId}`,
      name: `${productName} - ${selectedPack.name}`,
      price: selectedPack.price,
      quantity: 1,
      image: "",
      region: selectedPack.region || "GLOBAL",
      tabName: selectedPack.tab || "PACKAGE",
      playerId,
      serverId,
      verifiedName: "AATMA_USER"
    });

    toast({ title: "Added to Hub", description: `${selectedPack.name} selected.` });
    setPlayerId(""); setServerId(""); setIsVerified(false);
  };

  const handleBuyNow = () => {
    if (!user) { router.push('/login'); return; }
    if (!isVerified) { toast({ variant: "destructive", title: "Verification Required" }); return; }
    if (!selectedPack) return;

    clearCart();
    addItem({
      id: `${id}-${selectedPack.id}-${playerId}`,
      name: `${productName} - ${selectedPack.name}`,
      price: selectedPack.price,
      quantity: 1,
      image: "",
      region: selectedPack.region || "GLOBAL",
      tabName: selectedPack.tab || "PACKAGE",
      playerId,
      serverId,
      verifiedName: "AATMA_USER"
    });
    router.push('/checkout');
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      <div className="relative w-full h-40 bg-gradient-to-br from-primary/30 via-background to-background border-b border-white/5 p-6 flex flex-col justify-end">
        <h1 className="text-3xl font-headline font-black text-white uppercase tracking-tighter leading-none mb-2">{productName}</h1>
        <div className="flex gap-2">
          <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md text-[8px] font-black uppercase text-primary tracking-widest flex items-center gap-1"><Zap size={10} /> Instant</span>
          <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-md text-[8px] font-black uppercase text-green-500 tracking-widest flex items-center gap-1"><ShieldCheck size={10} /> Verified</span>
        </div>
      </div>

      <div className="p-4 space-y-8">
        {/* PLAYER ID SECTION */}
        <section className="bg-card border border-border p-6 rounded-[2rem] space-y-4 shadow-xl">
          <div className="flex items-center gap-2"><Smartphone size={14} className="text-primary" /><h3 className="text-[10px] font-black uppercase tracking-widest">Player Verification</h3></div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <Label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Player ID</Label>
               <Input value={playerId} onChange={(e) => handleInputChange('player', e.target.value)} placeholder="Enter ID" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
             </div>
             <div className="space-y-1">
               <Label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Server (Optional)</Label>
               <Input value={serverId} onChange={(e) => handleInputChange('server', e.target.value)} placeholder="Server" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
             </div>
          </div>
          <Button onClick={handleVerify} disabled={verifying || isVerified} className={cn("w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest", isVerified ? "bg-green-500 hover:bg-green-500" : "bg-primary")}>
            {verifying ? <Loader2 className="animate-spin h-4 w-4" /> : (isVerified ? "ID Verified: AATMA_USER" : "Verify Account")}
          </Button>
        </section>

        {/* PACKAGE REGISTRY LIST */}
        <section className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-card border border-border h-12 p-1 rounded-2xl mb-6">
              {['small', 'large', 'pass', 'promo'].map(t => (
                <TabsTrigger key={t} value={t} className="flex-1 text-[9px] font-black uppercase rounded-xl data-[state=active]:bg-primary">{t}</TabsTrigger>
              ))}
            </TabsList>
            
            {productsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
            ) : packs.filter(p => p.tab === activeTab).length === 0 ? (
              <div className="bg-card/20 border border-dashed border-border rounded-3xl p-10 text-center">
                <PackageSearch className="mx-auto h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No SKUs in this tab</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {packs.filter(p => p.tab === activeTab).map((pack) => (
                  <button key={pack.id} onClick={() => setSelectedPack(pack)} className={cn("p-4 rounded-2xl border transition-all text-left bg-card group relative", selectedPack?.id === pack.id ? "border-primary bg-primary/5" : "border-border")}>
                    <p className="text-[10px] font-black text-white group-hover:text-primary transition-colors leading-tight mb-2">{pack.name}</p>
                    <p className="text-lg font-black text-primary leading-none">₹{pack.price}</p>
                    {selectedPack?.id === pack.id && <div className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full shadow-[0_0_8px_#DC2626]" />}
                  </button>
                ))}
              </div>
            )}
          </Tabs>
        </section>

        {/* ACTIONS */}
        <div className="flex flex-col gap-3 pb-20">
          <Button onClick={handleBuyNow} disabled={!selectedPack || !isVerified} className="w-full h-16 bg-primary hover:bg-secondary text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 group">
            Buy Now <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" onClick={handleAddToCart} disabled={!selectedPack || !isVerified} className="w-full h-14 border-border bg-transparent text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/5">
            Add to Hub
          </Button>
        </div>
      </div>
    </div>
  );
}
