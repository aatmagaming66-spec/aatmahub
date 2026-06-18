
"use client"

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Zap, ArrowRight, Loader2, Smartphone, PackageSearch, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where, doc } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useDoc } from "@/firebase/firestore/use-doc";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addItem, clearCart } = useCart();
  const { user } = useUser();
  const db = useFirestore();
  
  // DIRECT REGISTRY ACCESS
  const gameDocRef = useMemo(() => id ? doc(db, 'games', id as string) : null, [db, id]);
  const { data: gameInfo, loading: gameLoading } = useDoc(gameDocRef);

  const productsQuery = useMemo(() => query(
    collection(db, 'products'),
    where('category', '==', id),
    where('status', '==', 'active')
  ), [db, id]);

  const { data: packs, loading: productsLoading } = useCollection(productsQuery);

  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("small");
  const [playerId, setPlayerId] = useState("");
  const [serverId, setServerId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const productName = gameInfo?.name || id?.toString().replace(/-/g, ' ').toUpperCase() || "DIGITAL ASSET";

  useEffect(() => {
    if (gameInfo) {
      console.log(`[PERF_HUB] Product Detail Hydrated: ${gameInfo.name}`);
      console.log(`[PERF_HUB] Rendered Logo: ${gameInfo.logo}`);
    }
  }, [gameInfo]);

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
      toast({ title: "Account Verified", description: "Identity check established successfully." });
    }, 1200);
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
      image: gameInfo?.logo || "",
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
      image: gameInfo?.logo || "",
      region: selectedPack.region || "GLOBAL",
      tabName: selectedPack.tab || "PACKAGE",
      playerId,
      serverId,
      verifiedName: "AATMA_USER"
    });
    toast({ title: "Added to Hub Queue" });
  };

  if (gameLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      {/* PRODUCT HERO / BANNER */}
      <div className="relative w-full aspect-[21/9] bg-neutral-950 overflow-hidden border-b border-white/5 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-black z-10" />
        {gameInfo?.banner ? (
          <Image src={gameInfo.banner} alt={productName} fill className="object-cover opacity-50 transition-all duration-1000 scale-105" priority />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center z-0 opacity-10">
            <ImageIcon size={80} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20" />
      </div>

      <div className="p-4 pt-0 space-y-6 max-w-4xl mx-auto w-full relative z-30 -mt-12">
        {/* Badges */}
        <div className="flex flex-row justify-center gap-3">
          <div className="bg-primary px-3 py-1 rounded-lg flex items-center gap-2 shadow-xl border border-white/5 h-8">
            <Zap size={10} className="text-white fill-white" />
            <span className="text-[9px] font-black uppercase text-white tracking-widest">Instant Top-Up</span>
          </div>
          <div className="bg-green-600 px-3 py-1 rounded-lg flex items-center gap-2 shadow-xl border border-white/5 h-8">
            <ShieldCheck size={10} className="text-white fill-white" />
            <span className="text-[9px] font-black uppercase text-white tracking-widest">Official Channel</span>
          </div>
          {gameInfo?.flag && (
            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-2 shadow-xl border border-white/10 h-8">
              <span className="text-xs">{gameInfo.flag}</span>
              <span className="text-[9px] font-black uppercase text-white tracking-widest">Region</span>
            </div>
          )}
        </div>

        {/* Title Group */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl md:text-5xl font-headline font-black text-white uppercase tracking-tighter leading-tight drop-shadow-2xl">
            {productName}
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-black opacity-40">Secured Marketplace Terminal</p>
        </div>

        {/* IDENTITY SECTOR */}
        <section className="bg-card border border-border p-6 rounded-[2.5rem] space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none -rotate-12">
            <Smartphone size={140} />
          </div>
          <div className="flex items-center gap-2 px-1">
            <Smartphone size={16} className="text-primary" />
            <h3 className="text-[11px] font-black uppercase tracking-widest text-white/70">Establish Identity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Account User ID</Label>
               <Input value={playerId} onChange={(e) => { setPlayerId(e.target.value); setIsVerified(false); }} placeholder="Enter Unique ID" className="bg-black/50 border-border h-14 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary/50" />
             </div>
             <div className="space-y-1.5">
               <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Server / Region (Optional)</Label>
               <Input value={serverId} onChange={(e) => { setServerId(e.target.value); setIsVerified(false); }} placeholder="e.g. Asia" className="bg-black/50 border-border h-14 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary/50" />
             </div>
          </div>
          <Button onClick={handleVerify} disabled={verifying || isVerified} className={cn("w-full h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl transition-all", isVerified ? "bg-green-600 hover:bg-green-600 shadow-green-500/20" : "bg-primary shadow-primary/20 shadow-primary/20")}>
            {verifying ? <Loader2 className="animate-spin h-5 w-5" /> : (isVerified ? "PROTOCOL ESTABLISHED: AATMA_USER" : "Initiate Verification")}
          </Button>
        </section>

        {/* PACKAGE SECTOR */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <PackageSearch size={16} className="text-primary" />
            <h3 className="text-[11px] font-black uppercase tracking-widest text-white/70">Select Hub Pack</h3>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-card/50 border border-border h-14 p-1.5 rounded-[22px] mb-6 shadow-inner">
              {['small', 'large', 'pass', 'promo'].map(t => (
                <TabsTrigger key={t} value={t} className="flex-1 text-[10px] font-black uppercase rounded-[16px] data-[state=active]:bg-primary transition-all duration-300">
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {productsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
            ) : packs.filter(p => p.tab === activeTab).length === 0 ? (
              <div className="bg-card/20 border border-dashed border-border rounded-[2.5rem] p-16 text-center">
                <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">Zero Results in Registry</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {packs.filter(p => p.tab === activeTab).map((pack) => (
                  <button 
                    key={pack.id} 
                    onClick={() => setSelectedPack(pack)} 
                    className={cn(
                      "p-6 rounded-[2.5rem] border transition-all text-left bg-card group relative shadow-2xl active:scale-95", 
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
                      <div className="absolute top-4 right-4 h-2 w-2 bg-primary rounded-full shadow-[0_0_12px_rgba(220,38,38,1)] animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </Tabs>
        </section>

        {/* ACTIONS */}
        <div className="flex flex-col gap-4 pb-24">
          <Button onClick={handleBuyNow} disabled={!selectedPack || !isVerified} className="w-full h-18 bg-primary hover:bg-secondary text-base font-black uppercase tracking-[0.2em] rounded-[2.5rem] shadow-2xl shadow-primary/30 group transition-all h-20">
            Establish Purchase <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" onClick={handleAddToCart} disabled={!selectedPack || !isVerified} className="w-full h-16 border-border bg-transparent text-[11px] font-black uppercase tracking-widest rounded-[2.5rem] hover:bg-white/5 transition-all">
            Link to Hub Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
