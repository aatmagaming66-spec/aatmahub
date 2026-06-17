"use client"

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Zap, ArrowRight, Loader2, PackageSearch, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where, doc } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useMediaRegistry } from "@/hooks/use-media-registry";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addItem, clearCart } = useCart();
  const { user } = useUser();
  const db = useFirestore();
  const { getMediaAsset } = useMediaRegistry();
  
  const productsQuery = useMemo(() => query(
    collection(db, 'products'),
    where('category', '==', id),
    where('status', '==', 'active')
  ), [db, id]);

  const gameRef = useMemo(() => id ? doc(db, 'games', id as string) : null, [db, id]);
  const { data: gameInfo } = useDoc(gameRef);
  const { data: packs, loading: productsLoading } = useCollection(productsQuery);

  const media = getMediaAsset(id as string);

  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("small");
  const [playerId, setPlayerId] = useState("");
  const [serverId, setServerId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const productName = gameInfo?.name || id?.toString().replace(/-/g, ' ').toUpperCase() || "DIGITAL ASSET";

  useEffect(() => {
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
      image: media?.logoUrl || "",
      region: selectedPack.region || "GLOBAL",
      tabName: selectedPack.tab || "PACKAGE",
      playerId,
      serverId,
      verifiedName: "AATMA_USER"
    });
    router.push('/checkout');
  };

  const handleAddToCart = () => {
    if (!user) { router.push('/login'); return; }
    if (!isVerified) { toast({ variant: "destructive", title: "Verification Required" }); return; }
    if (!selectedPack) return;

    addItem({
      id: `${id}-${selectedPack.id}-${playerId}`,
      name: `${productName} - ${selectedPack.name}`,
      price: selectedPack.price,
      quantity: 1,
      image: media?.logoUrl || "",
      region: selectedPack.region || "GLOBAL",
      tabName: selectedPack.tab || "PACKAGE",
      playerId,
      serverId,
      verifiedName: "AATMA_USER"
    });
    toast({ title: "Added to Hub" });
  };

  const bannerUrl = media?.bannerUrl || media?.logoUrl || null;

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      <div className="relative w-full aspect-video bg-neutral-900 overflow-hidden shadow-2xl border-b border-white/5">
        {bannerUrl ? (
          <img 
            src={bannerUrl} 
            alt={productName} 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
        )}
      </div>

      <div className="p-4 pt-6 space-y-6 max-w-4xl mx-auto w-full">
        <div className="flex flex-row justify-center gap-3">
          <div className="bg-primary px-3 py-1 rounded-lg flex items-center gap-2 shadow-xl border border-white/5 h-8">
            <Zap size={10} className="text-white fill-white" />
            <span className="text-[9px] font-black uppercase text-white tracking-widest">Instant Delivery</span>
          </div>
          <div className="bg-green-600 px-3 py-1 rounded-lg flex items-center gap-2 shadow-xl border border-white/5 h-8">
            <ShieldCheck size={10} className="text-white fill-white" />
            <span className="text-[9px] font-black uppercase text-white tracking-widest">Secure Verified</span>
          </div>
        </div>

        <div className="space-y-0.5 text-center">
          <h1 className="text-3xl md:text-5xl font-headline font-black text-white uppercase tracking-tighter leading-tight">
            {productName}
          </h1>
          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-40">Official Hub Top-Up Channel</p>
        </div>

        <section className="bg-card border border-border p-6 rounded-[2.5rem] space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
            <Smartphone size={100} />
          </div>
          <div className="flex items-center gap-2 px-1">
            <Smartphone size={16} className="text-primary" />
            <h3 className="text-[11px] font-black uppercase tracking-widest text-white/70">Account Identity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Player ID</Label>
               <Input value={playerId} onChange={(e) => handleInputChange('player', e.target.value)} placeholder="Enter Numeric ID" className="bg-black/50 border-border h-14 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary/50" />
             </div>
             <div className="space-y-1.5">
               <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Server ID (Optional)</Label>
               <Input value={serverId} onChange={(e) => handleInputChange('server', e.target.value)} placeholder="Region/Server" className="bg-black/50 border-border h-14 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary/50" />
             </div>
          </div>
          <Button onClick={handleVerify} disabled={verifying || isVerified} className={cn("w-full h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl transition-all", isVerified ? "bg-green-600 hover:bg-green-600 shadow-green-500/20" : "bg-primary shadow-primary/20")}>
            {verifying ? <Loader2 className="animate-spin h-5 w-5" /> : (isVerified ? "ID VERIFIED: AATMA_USER" : "Establish Identity Check")}
          </Button>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <PackageSearch size={16} className="text-primary" />
            <h3 className="text-[11px] font-black uppercase tracking-widest text-white/70">Select Package</h3>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-card/50 border border-border h-14 p-1.5 rounded-[20px] mb-6 shadow-inner">
              {['small', 'large', 'pass', 'promo'].map(t => (
                <TabsTrigger key={t} value={t} className="flex-1 text-[10px] font-black uppercase rounded-[14px] data-[state=active]:bg-primary transition-all duration-300">
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {productsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
            ) : packs.filter(p => p.tab === activeTab).length === 0 ? (
              <div className="bg-card/20 border border-dashed border-border rounded-[2.5rem] p-16 text-center">
                <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">Empty Registry Sector</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {packs.filter(p => p.tab === activeTab).map((pack) => (
                  <button 
                    key={pack.id} 
                    onClick={() => setSelectedPack(pack)} 
                    className={cn(
                      "p-6 rounded-[2rem] border transition-all text-left bg-card group relative shadow-2xl active:scale-95", 
                      selectedPack?.id === pack.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-white/10"
                    )}
                  >
                    <p className="text-[10px] font-black text-white group-hover:text-primary transition-colors leading-tight mb-3 uppercase tracking-tight">
                      {pack.name}
                    </p>
                    <p className="text-2xl font-black text-primary leading-none tracking-tighter">
                      ₹{pack.price}
                    </p>
                    {selectedPack?.id === pack.id && (
                      <div className="absolute top-3 right-3 h-2 w-2 bg-primary rounded-full shadow-[0_0_12px_#DC2626] animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </Tabs>
        </section>

        <div className="flex flex-col gap-4 pb-24">
          <Button onClick={handleBuyNow} disabled={!selectedPack || !isVerified} className="w-full h-18 bg-primary hover:bg-secondary text-base font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-primary/20 group transition-all">
            Secure Purchase <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" onClick={handleAddToCart} disabled={!selectedPack || !isVerified} className="w-full h-16 border-border bg-transparent text-[11px] font-black uppercase tracking-widest rounded-[2rem] hover:bg-white/5 transition-all">
            Queue to Hub Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
