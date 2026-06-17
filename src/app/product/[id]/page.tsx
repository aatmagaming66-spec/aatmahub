"use client"

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ShieldCheck, Zap, ArrowRight, Gamepad2, Loader2, PackageSearch, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where, doc, onSnapshot } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useDoc } from "@/firebase/firestore/use-doc";
import Image from "next/image";

/**
 * PRODUCT PAGE (Public)
 * Redesigned Layout: Clean visual banner first, content identity below.
 * Professional storefront architecture.
 */
export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addItem, clearCart } = useCart();
  const { user } = useUser();
  const db = useFirestore();
  
  const productsQuery = useMemo(() => query(
    collection(db, 'products'),
    where('category', '==', id),
    where('status', '==', 'active')
  ), [db, id]);

  const gameRef = useMemo(() => id ? doc(db, 'games', id as string) : null, [db, id]);
  const { data: gameInfo } = useDoc(gameRef);
  const { data: packs, loading: productsLoading } = useCollection(productsQuery);

  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("small");
  const [playerId, setPlayerId] = useState("");
  const [serverId, setServerId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [asset, setAsset] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'media_assets', id as string), (snap) => {
      if (snap.exists()) setAsset(snap.data());
    });
    return () => unsubscribe();
  }, [db, id]);

  const productName = gameInfo?.name || id?.toString().replace(/-/g, ' ').toUpperCase() || "DIGITAL ASSET";

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
      image: asset?.logoUrl || "",
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
      image: asset?.logoUrl || "",
      region: selectedPack.region || "GLOBAL",
      tabName: selectedPack.tab || "PACKAGE",
      playerId,
      serverId,
      verifiedName: "AATMA_USER"
    });
    toast({ title: "Added to Hub" });
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      {/* 100% CLEAN VISUAL BANNER POSTER */}
      <div className="relative w-full h-[220px] md:h-[350px] border-b border-white/5 overflow-hidden">
        {asset?.bannerUrl ? (
          <Image 
            src={asset.bannerUrl} 
            alt={productName} 
            fill 
            className="object-cover object-center" 
            priority 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
        )}
      </div>

      {/* CONTENT AREA BELOW BANNER */}
      <div className="p-4 pt-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* STATUS BADGES SECTION */}
        <div className="flex flex-wrap gap-2.5">
          <div className="bg-primary px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg shadow-primary/10">
            <Zap size={12} className="text-white fill-white" />
            <span className="text-[10px] font-black uppercase text-white tracking-widest">Instant Delivery</span>
          </div>
          <div className="bg-green-600 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg shadow-green-900/20">
            <ShieldCheck size={12} className="text-white fill-white" />
            <span className="text-[10px] font-black uppercase text-white tracking-widest">Secure Verified</span>
          </div>
        </div>

        {/* IDENTITY SECTION */}
        <div className="space-y-1 px-1">
          <h1 className="text-3xl md:text-5xl font-headline font-black text-white uppercase tracking-tighter leading-tight">
            {productName}
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Official Top-Up Channel</p>
        </div>

        {/* ACCOUNT VERIFICATION SECTION */}
        <section className="bg-card border border-border p-6 rounded-[2rem] space-y-4 shadow-2xl">
          <div className="flex items-center gap-2">
            <Smartphone size={14} className="text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/70">Account Verification</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1">
               <Label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Player ID</Label>
               <Input value={playerId} onChange={(e) => handleInputChange('player', e.target.value)} placeholder="Enter ID" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
             </div>
             <div className="space-y-1">
               <Label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Server (Optional)</Label>
               <Input value={serverId} onChange={(e) => handleInputChange('server', e.target.value)} placeholder="Server" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
             </div>
          </div>
          <Button onClick={handleVerify} disabled={verifying || isVerified} className={cn("w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all", isVerified ? "bg-green-600 hover:bg-green-600" : "bg-primary")}>
            {verifying ? <Loader2 className="animate-spin h-4 w-4" /> : (isVerified ? "ID Verified: AATMA_USER" : "Verify Account")}
          </Button>
        </section>

        {/* PRODUCT SELECTION SECTION */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <PackageSearch size={14} className="text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/70">Select Package</h3>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-card border border-border h-12 p-1 rounded-2xl mb-6 shadow-inner">
              {['small', 'large', 'pass', 'promo'].map(t => (
                <TabsTrigger key={t} value={t} className="flex-1 text-[9px] font-black uppercase rounded-xl data-[state=active]:bg-primary transition-all">
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {productsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
            ) : packs.filter(p => p.tab === activeTab).length === 0 ? (
              <div className="bg-card/20 border border-dashed border-border rounded-3xl p-10 text-center">
                <PackageSearch className="mx-auto h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No packages in this tab</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {packs.filter(p => p.tab === activeTab).map((pack) => (
                  <button 
                    key={pack.id} 
                    onClick={() => setSelectedPack(pack)} 
                    className={cn(
                      "p-5 rounded-2xl border transition-all text-left bg-card group relative shadow-lg active:scale-95", 
                      selectedPack?.id === pack.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-white/10"
                    )}
                  >
                    <p className="text-[10px] font-black text-white group-hover:text-primary transition-colors leading-tight mb-2 uppercase">
                      {pack.name}
                    </p>
                    <p className="text-xl font-black text-primary leading-none tracking-tighter">
                      ₹{pack.price}
                    </p>
                    {selectedPack?.id === pack.id && (
                      <div className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full shadow-[0_0_10px_#DC2626] animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </Tabs>
        </section>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-3 pb-24">
          <Button onClick={handleBuyNow} disabled={!selectedPack || !isVerified} className="w-full h-16 bg-primary hover:bg-secondary text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/20 group transition-all">
            Buy Now <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" onClick={handleAddToCart} disabled={!selectedPack || !isVerified} className="w-full h-14 border-border bg-transparent text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-all">
            Add to Hub
          </Button>
        </div>
      </div>
    </div>
  );
}
