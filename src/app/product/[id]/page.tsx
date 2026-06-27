"use client"

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Loader2, ImageIcon, MessageCircle } from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useGlobalSettings } from "@/firebase/settings-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, where } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { siteSettings } = useGlobalSettings();
  const { user } = useUser();
  const { addItem, clearCart } = useCart();
  const { toast } = useToast();
  
  const gameDocRef = useMemo(() => id ? doc(db, 'games', id as string) : null, [db, id]);
  const { data: gameInfo, loading: gameLoading } = useDoc(gameDocRef);

  const isManualCategory = useMemo(() => {
    return gameInfo?.category === "OTT Services" || gameInfo?.category === "Social Services";
  }, [gameInfo]);

  // PRODUCT LOGIC FOR GAMES
  const productsQuery = useMemo(() => query(
    collection(db, 'products'),
    where('category', '==', id),
    where('status', '==', 'active')
  ), [db, id]);

  const { data: packs, loading: productsLoading } = useCollection(productsQuery);

  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [playerId, setPlayerId] = useState("");
  const [serverId, setServerId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!isManualCategory && packs && packs.length > 0 && !selectedPack) {
      setSelectedPack(packs[0]);
    }
  }, [packs, selectedPack, isManualCategory]);

  const handleWhatsAppOrder = () => {
    const whatsappNumber = siteSettings?.contactWhatsApp?.replace(/\D/g, '') || "918566936666";
    const message = `Hello Aatma HUB,\nI want to order ${gameInfo?.name || id}.\n\nPlease provide available options and pricing.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleVerify = () => {
    if (!playerId) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setIsVerified(true);
    }, 800);
  };

  const handleBuyNow = () => {
    if (!user) { router.push('/login'); return; }
    if (!isVerified || !selectedPack) return;
    clearCart();
    addItem({
      id: `${id}-${selectedPack.id}-${playerId}`,
      name: `${gameInfo?.name} - ${selectedPack.name}`,
      price: selectedPack.price,
      quantity: 1,
      image: gameInfo?.logo || "",
      region: selectedPack.region || "Global",
      playerId,
      serverId,
      verifiedName: "Verified User"
    });
    router.push('/checkout');
  };

  if (gameLoading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;
  }

  if (isManualCategory) {
    return (
      <div className="flex flex-col w-full animate-in fade-in duration-700">
        <div className="relative w-full aspect-video bg-background overflow-hidden border-b border-white/5 shadow-2xl md:rounded-b-3xl">
          {gameInfo?.banner && <Image src={gameInfo.banner} alt={gameInfo.name} fill className="object-cover" priority />}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20" />
        </div>
        <div className="p-6 max-w-4xl mx-auto w-full -mt-20 relative z-30 space-y-8 text-center">
          <div className="inline-flex bg-accent/20 border border-accent/30 px-4 py-2 rounded-xl items-center gap-2 shadow-2xl">
            <MessageCircle size={16} className="text-accent" />
            <span className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Manual Order Required</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-black text-white uppercase tracking-tighter drop-shadow-2xl">
            {gameInfo?.name}
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium max-w-md mx-auto leading-relaxed">
            Pricing and plans for {gameInfo?.name} are managed manually to ensure instant delivery. Please contact our support hub for current availability.
          </p>
          <div className="pt-8">
            <Button 
              onClick={handleWhatsAppOrder} 
              className="w-full max-w-md h-14 bg-green-600 hover:bg-green-700 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl shadow-green-500/20 group transition-all gap-3"
            >
              <MessageCircle size={18} /> 
              Order via WhatsApp 
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      <div className="relative w-full aspect-video bg-background overflow-hidden border-b border-white/5 shadow-2xl md:rounded-b-3xl">
        {gameInfo?.banner ? (
          <Image src={gameInfo.banner} alt={gameInfo.name} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center z-0 opacity-10"><ImageIcon size={80} /></div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20" />
      </div>

      <div className="p-4 pt-0 space-y-6 max-w-4xl mx-auto w-full relative z-30 -mt-12">
        <div className="text-center space-y-1">
          <h1 className="text-3xl md:text-5xl font-headline font-black text-white uppercase tracking-tighter drop-shadow-2xl">
            {gameInfo?.name}
          </h1>
        </div>

        <section className="bg-card border border-border p-4 rounded-2xl space-y-3 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <div className="space-y-1">
               <Label className="text-[9px] font-black uppercase text-muted-foreground">User ID</Label>
               <Input value={playerId} onChange={(e) => { setPlayerId(e.target.value); setIsVerified(false); }} placeholder="Enter ID" className="bg-black/50 border-border h-11 rounded-xl text-sm font-bold" />
             </div>
             <div className="space-y-1">
               <Label className="text-[9px] font-black uppercase text-muted-foreground">Server</Label>
               <Input value={serverId} onChange={(e) => { setServerId(e.target.value); setIsVerified(false); }} placeholder="e.g. 1234" className="bg-black/50 border-border h-11 rounded-xl text-sm font-bold" />
             </div>
          </div>
          <Button onClick={handleVerify} disabled={verifying || isVerified} className={cn("w-full h-11 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all", isVerified ? "bg-green-600 hover:bg-green-600" : "bg-primary")}>
            {verifying ? <Loader2 className="animate-spin h-4 w-4" /> : (isVerified ? "Verified" : "Verify Account")}
          </Button>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1 mb-4">
            <div className="h-4 w-1 bg-primary rounded-none shadow-[0_0_8px_#DC2626]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Available Packages</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {packs?.map((pack) => (
              <button 
                key={pack.id} 
                onClick={() => setSelectedPack(pack)} 
                className={cn(
                  "p-4 rounded-xl border transition-all text-center group relative shadow-2xl flex flex-col items-center justify-center gap-2 min-h-[100px]", 
                  selectedPack?.id === pack.id 
                    ? "bg-gradient-to-br from-[#110000] via-[#dc2626] to-[#ec4899] border-primary shadow-[0_0_30px_rgba(220,38,38,0.4)] scale-[1.02]" 
                    : "bg-white/5 border-white/5 hover:border-primary/40"
                )}
              >
                <p className={cn(
                  "text-[10px] font-black uppercase transition-colors leading-tight",
                  selectedPack?.id === pack.id ? "text-white" : "text-white/60 group-hover:text-white"
                )}>
                  {pack.name}
                </p>
                <p className={cn(
                  "text-sm font-black leading-none tracking-tighter",
                  selectedPack?.id === pack.id ? "text-white" : "text-primary"
                )}>
                  ₹{pack.price}
                </p>
              </button>
            ))}
            {productsLoading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-white/5 animate-pulse rounded-xl border border-white/5" />
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-4 pb-24 pt-4">
          <Button onClick={handleBuyNow} disabled={!selectedPack || !isVerified} className="w-full bg-primary hover:bg-secondary text-base font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl h-20">
            Buy Now <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
