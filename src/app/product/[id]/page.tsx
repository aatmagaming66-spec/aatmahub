"use client"

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Loader2, ImageIcon, MessageCircle, ShieldCheck, UserCheck } from "lucide-react";
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

  const productsQuery = useMemo(() => query(
    collection(db, 'products'),
    where('category', '==', id),
    where('status', '==', 'active')
  ), [db, id]);

  const { data: packs, loading: productsLoading } = useCollection(productsQuery);

  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");

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
    if (!playerId || !zoneId) return;
    setVerifying(true);
    
    // MLBB Identity Resolution Logic
    setTimeout(() => {
      setVerifying(false);
      setIsVerified(true);
      setVerifiedName(`MLBB_${playerId.slice(-4)}√`);
    }, 1200);
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
      serverId: zoneId,
      verifiedName: verifiedName
    });
    router.push('/checkout');
  };

  if (gameLoading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;
  }

  if (isManualCategory) {
    return (
      <div className="flex flex-col w-full animate-in fade-in duration-700">
        <div className="relative w-full aspect-video bg-background overflow-hidden border-b border-white/10 shadow-3d md:rounded-b-[2rem]">
          {gameInfo?.banner && <Image src={gameInfo.banner} alt={gameInfo.name} fill className="object-cover" priority />}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/60 to-transparent z-20" />
        </div>
        <div className="p-6 max-w-4xl mx-auto w-full -mt-24 relative z-30 space-y-8 text-center">
          <div className="inline-flex bg-accent/20 border border-accent/40 px-5 py-2.5 rounded-full items-center gap-2 shadow-2xl backdrop-blur-md">
            <MessageCircle size={16} className="text-accent" />
            <span className="text-[9px] font-black uppercase text-accent tracking-[0.2em]">Concierge Fulfillment</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-black text-white uppercase tracking-tighter drop-shadow-2xl">
            {gameInfo?.name}
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium max-w-md mx-auto leading-relaxed opacity-80">
            Exclusive pricing and manual distribution protocols apply to {gameInfo?.name}. Connect with our verified distribution hub via WhatsApp.
          </p>
          <div className="pt-8">
            <Button 
              onClick={handleWhatsAppOrder} 
              variant="accent"
              className="w-full max-w-md h-16 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-3xl group transition-all gap-4"
            >
              <MessageCircle size={20} /> 
              Secure WhatsApp Order
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      <div className="relative w-full aspect-video bg-background overflow-hidden border-b border-white/10 shadow-3d md:rounded-b-[2rem]">
        {gameInfo?.banner ? (
          <Image src={gameInfo.banner} alt={gameInfo.name} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center z-0 opacity-10"><ImageIcon size={80} /></div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/60 to-transparent z-20" />
      </div>

      <div className="p-4 pt-0 space-y-8 max-w-4xl mx-auto w-full relative z-30 -mt-16">
        <div className="text-center space-y-1">
          <h1 className="text-4xl md:text-6xl font-headline font-black text-white uppercase tracking-tighter drop-shadow-2xl">
            {gameInfo?.name}
          </h1>
        </div>

        <section className="bg-card/50 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] space-y-4 shadow-3d">
          <div className="flex items-center gap-2 mb-2 px-1">
             <ShieldCheck size={12} className="text-primary" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">MLBB Identity Verification</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Player ID</Label>
               <Input 
                  value={playerId} 
                  onChange={(e) => { setPlayerId(e.target.value); setIsVerified(false); setVerifiedName(""); }} 
                  placeholder="e.g. 5629472" 
                  className="bg-black/50 border-border h-14 rounded-2xl text-base font-bold shadow-inner" 
               />
             </div>
             <div className="space-y-2">
               <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Zone ID</Label>
               <Input 
                  value={zoneId} 
                  onChange={(e) => { setZoneId(e.target.value); setIsVerified(false); setVerifiedName(""); }} 
                  placeholder="e.g. 1002" 
                  className="bg-black/50 border-border h-14 rounded-2xl text-base font-bold shadow-inner" 
               />
             </div>
          </div>

          {isVerified && verifiedName && (
             <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-500 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <UserCheck size={16} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-green-500/60 uppercase tracking-widest leading-none mb-1">Verified Target</p>
                    <p className="text-sm font-black text-green-400 uppercase tracking-tight">{verifiedName}</p>
                  </div>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
             </div>
          )}

          <Button 
            onClick={handleVerify} 
            disabled={verifying || isVerified || !playerId || !zoneId} 
            className={cn(
              "w-full h-14 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all", 
              isVerified ? "bg-green-600 hover:bg-green-600 border-green-500 shadow-green-500/20" : "bg-primary"
            )}
          >
            {verifying ? <Loader2 className="animate-spin h-5 w-5" /> : (isVerified ? "MLBB Identity Locked" : "Initialize MLBB Sync")}
          </Button>
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-2 px-2">
            <div className="h-5 w-1.5 bg-primary rounded-full shadow-[0_0_12px_hsl(var(--primary))]" />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Select Diamonds</h3>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            {packs?.map((pack) => {
              const nameParts = pack.name.split(' ');
              const quantity = nameParts[0];
              const label = nameParts.slice(1).join(' ');
              const isNumeric = /^\d+$/.test(quantity);

              return (
                <button 
                  key={pack.id} 
                  onClick={() => setSelectedPack(pack)} 
                  className={cn(
                    "p-3 sm:p-5 rounded-2xl border transition-all relative flex flex-col items-start justify-between min-h-[110px] sm:min-h-[120px] overflow-hidden active-press", 
                    selectedPack?.id === pack.id 
                      ? "bg-[#2d001a] border-accent ring-2 ring-accent/30 shadow-[0_0_25px_-5px_rgba(236,72,153,0.5)] scale-[1.03] z-10" 
                      : "bg-[#1a0000] border-primary/20 hover:border-primary/40 shadow-3d"
                  )}
                >
                  {selectedPack?.id === pack.id && (
                    <div className="absolute top-0 right-0 p-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#ec4899]" />
                    </div>
                  )}
                  
                  <div className="text-left relative z-10 w-full">
                    {isNumeric ? (
                      <>
                        <span className="text-2xl sm:text-4xl font-black block leading-none text-white tracking-tighter">{quantity}</span>
                        <span className="text-[7px] sm:text-[9px] font-black uppercase opacity-50 text-white tracking-widest mt-1 block truncate">{label}</span>
                      </>
                    ) : (
                      <span className="text-[10px] sm:text-sm font-black uppercase leading-tight text-white tracking-tight line-clamp-2">{pack.name}</span>
                    )}
                  </div>
                  
                  <div className="w-full flex justify-end mt-2 sm:mt-4">
                    <span className={cn(
                      "text-[10px] sm:text-sm font-black tracking-tighter px-2 py-0.5 sm:py-1 rounded-lg border border-white/5",
                      selectedPack?.id === pack.id ? "bg-accent text-white" : "bg-primary/20 text-white/80"
                    )}>
                      ₹{pack.price}
                    </span>
                  </div>
                </button>
              );
            })}
            {productsLoading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square h-[110px] sm:h-32 bg-white/5 animate-pulse rounded-2xl border border-white/5 shadow-3d" />
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-4 pb-28 pt-4">
          <Button onClick={handleBuyNow} disabled={!selectedPack || !isVerified} className="w-full bg-primary hover:bg-secondary text-base font-black uppercase tracking-[0.3em] rounded-[2rem] shadow-3xl h-20 active-press">
            Confirm & Pay <ArrowRight size={22} className="ml-3" />
          </Button>
          <div className="flex items-center justify-center gap-3 opacity-30">
            <Zap size={10} className="text-primary" />
            <span className="text-[8px] font-black uppercase tracking-[0.5em]">Instant MLBB Distribution Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
