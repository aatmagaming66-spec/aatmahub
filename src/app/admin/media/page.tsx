'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useStorage } from '@/firebase/provider';
import { 
  collection, 
  query, 
  doc, 
  updateDoc, 
  onSnapshot,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Upload, 
  ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MediaAsset {
  id: string;
  entityId: string;
  entityType: string;
  entityName: string;
  logoUrl?: string;
  bannerUrl?: string;
  imageUrl?: string; // Alias for logoUrl used by marketplace
}

export default function MediaHub() {
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'media_assets'), orderBy('entityName', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as MediaAsset));
      setAssets(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = a.entityName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           a.entityId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || a.entityType === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [assets, searchQuery, filterType]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase text-white">Media Registry</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Single Source of Truth for Assets</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="Search entities..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="bg-card border-border pl-10 h-12 rounded-2xl text-xs font-bold focus:border-primary shadow-xl ring-0 w-full outline-none" 
            />
          </div>
          <div className="flex gap-2 bg-card p-1 rounded-2xl border border-border">
            {['all', 'game', 'ott', 'social'].map((t) => (
              <button 
                key={t} 
                onClick={() => setFilterType(t)} 
                className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", 
                  filterType === t ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      {filteredAssets.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[2.5rem] p-20 text-center space-y-4">
           <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">No assets in registry</p>
           <p className="text-[9px] text-muted-foreground uppercase max-w-xs mx-auto">Go to System Settings and click "Initialize Registry Metadata" to prepare the hub.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <MediaAssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaAssetCard({ asset }: { asset: MediaAsset }) {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    try {
      // 1. Storage Reference: Persistent HTTPS path
      const fileExt = file.name.split('.').pop() || 'png';
      const path = `media_assets/${asset.entityType}/${asset.entityId}/${type}_${Date.now()}.${fileExt}`;
      const sRef = ref(storage, path);
      
      // 2. Transmit to Cloud
      const snapshot = await uploadBytes(sRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // 3. Update Registry Immediately (Atomic persistence)
      const assetRef = doc(db, 'media_assets', asset.id);
      const updateData: any = {
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      };

      if (type === 'logo') {
        updateData.logoUrl = downloadUrl;
        updateData.imageUrl = downloadUrl; // Mirror for marketplace compatibility
      } else {
        updateData.bannerUrl = downloadUrl;
      }

      await updateDoc(assetRef, updateData);
      
      toast({ title: 'Cloud Transfer Complete', description: `${type.toUpperCase()} verified and saved.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Transfer Failed', description: err.message });
    } finally {
      setUploading(null);
    }
  };

  return (
    <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl flex flex-col group hover:border-primary/20 transition-all">
      {/* Banner Preview Area */}
      <div className="relative aspect-video bg-neutral-900 border-b border-white/5 flex items-center justify-center overflow-hidden">
        {asset.bannerUrl ? (
          <img src={asset.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : <ImageIcon size={40} className="opacity-10" />}
        
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[7px] font-black uppercase text-primary border border-white/10">
          {asset.entityType}
        </div>

        {uploading === 'banner' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Uploading Banner...</span>
          </div>
        )}
      </div>

      <CardContent className="p-6 space-y-6 flex-1">
        <div className="flex items-center gap-4">
          {/* Logo Preview */}
          <div className="h-16 w-12 rounded-xl bg-black/60 border border-white/5 overflow-hidden flex items-center justify-center shrink-0 relative">
            {asset.logoUrl ? (
              <img src={asset.logoUrl} alt="" className="w-full h-full object-cover" />
            ) : <ImageIcon size={20} className="opacity-20" />}
            
            {uploading === 'logo' && (
              <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
            )}
          </div>
          
          <div className="min-w-0">
            <h3 className="text-sm font-black uppercase tracking-tight text-white truncate">{asset.entityName}</h3>
            <p className="text-[7px] text-white/20 font-mono truncate uppercase">REF: {asset.entityId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-muted-foreground flex items-center justify-between">
              Logo (2:3) {asset.logoUrl && <CheckCircle2 size={10} className="text-green-500" />}
            </Label>
            <Button 
              variant="outline" 
              disabled={!!uploading}
              className="w-full h-10 rounded-xl bg-white/5 border-border text-[8px] font-black uppercase relative overflow-hidden group/btn"
            >
              <Upload size={12} className={cn("mr-1", asset.logoUrl ? "text-green-500" : "text-primary")} /> 
              {asset.logoUrl ? 'Replace' : 'Upload'}
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                onChange={(e) => handleUpload(e, 'logo')} 
              />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-muted-foreground flex items-center justify-between">
              Banner (16:9) {asset.bannerUrl && <CheckCircle2 size={10} className="text-green-500" />}
            </Label>
            <Button 
              variant="outline" 
              disabled={!!uploading}
              className="w-full h-10 rounded-xl bg-white/5 border-border text-[8px] font-black uppercase relative overflow-hidden group/btn"
            >
              <ImageIcon size={12} className={cn("mr-1", asset.bannerUrl ? "text-green-500" : "text-primary")} /> 
              {asset.bannerUrl ? 'Replace' : 'Upload'}
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                onChange={(e) => handleUpload(e, 'banner')} 
              />
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
             <AlertCircle size={12} className="text-muted-foreground" />
             <p className="text-[8px] text-muted-foreground uppercase leading-tight font-black">
               Uploads are persistent. Changes reflect on the marketplace instantly.
             </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
