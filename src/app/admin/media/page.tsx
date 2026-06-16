'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useStorage } from '@/firebase/provider';
import { 
  collection, 
  query, 
  doc, 
  setDoc, 
  onSnapshot,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Upload, 
  Trash2, 
  Save, 
  Gamepad2, 
  Tv, 
  Share2, 
  ImageIcon,
  Loader2,
  AlertCircle,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MediaAsset {
  id: string;
  entityId: string;
  entityType: 'game' | 'ott' | 'social' | 'branding';
  entityName: string;
  logoUrl?: string;
  bannerUrl?: string;
  isEnabled: boolean;
  updatedAt: string;
}

export default function DynamicMediaHub() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'game' | 'ott' | 'social'>('all');
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'media_assets'), orderBy('entityName', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setAssets(snap.docs.map(d => ({ ...d.data(), id: d.id } as MediaAsset)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = a.entityName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || a.entityType === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [assets, searchQuery, filterType]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none text-white">Media Hub 2.0</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60 mt-2">Centralized Asset Intelligence</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-card border-border pl-10 h-12 rounded-2xl text-xs font-bold focus:border-primary shadow-xl ring-0"
            />
          </div>
          <div className="flex gap-2 bg-card p-1 rounded-2xl border border-border">
            {['all', 'game', 'ott', 'social'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t as any)}
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
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">NO MEDIA ASSETS FOUND</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <MediaAssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Media Protocol</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          Changes to media assets reflect instantly on public hubs. Max size: 5MB. Formats: JPG, PNG, WEBP.
        </p>
      </div>
    </div>
  );
}

function MediaAssetCard({ asset }: { asset: MediaAsset }) {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [bannerProgress, setBannerProgress] = useState(0);
  
  const [localLogo, setLocalLogo] = useState<string | null>(asset.logoUrl || null);
  const [localBanner, setLocalBanner] = useState<string | null>(asset.bannerUrl || null);
  const [enabled, setEnabled] = useState(asset.isEnabled);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDATION
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please use JPG, PNG or WEBP.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File Too Large', description: 'Maximum file size is 5MB.' });
      return;
    }

    const storagePath = `media_assets/${asset.entityType}/${asset.entityId}/${type}_${Date.now()}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (type === 'logo') setLogoProgress(progress);
        else setBannerProgress(progress);
      }, 
      (error) => {
        toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        if (type === 'logo') {
          setLocalLogo(downloadURL);
          setLogoProgress(0);
        } else {
          setLocalBanner(downloadURL);
          setBannerProgress(0);
        }
        toast({ title: 'Buffer Updated', description: 'Asset ready to commit.' });
      }
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const assetRef = doc(db, 'media_assets', asset.id);
      await setDoc(assetRef, {
        ...asset,
        logoUrl: localLogo,
        bannerUrl: localBanner,
        isEnabled: enabled,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      toast({ title: 'Protocol Synchronized', description: `${asset.entityName} media updated.` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const Icon = asset.entityType === 'game' ? Gamepad2 : (asset.entityType === 'ott' ? Tv : Share2);
  const accent = asset.entityType === 'game' ? 'text-primary' : (asset.entityType === 'ott' ? 'text-accent' : 'text-blue-400');

  return (
    <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl group hover:border-primary/20 transition-all duration-500">
      {/* BANNER PREVIEW AREA */}
      <div className="relative aspect-video w-full bg-black/40 border-b border-white/5 flex items-center justify-center overflow-hidden">
        {localBanner ? (
          <Image src={localBanner} alt="Banner" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-10">
            <ImageIcon size={40} className="text-white" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">No Banner</span>
          </div>
        )}
        
        {bannerProgress > 0 && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 gap-2 z-20">
            <Progress value={bannerProgress} className="h-1 bg-white/10" />
            <span className="text-[8px] font-black text-white uppercase tracking-widest">Uploading...</span>
          </div>
        )}

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md p-1 px-3 rounded-lg border border-white/10 text-[7px] font-black uppercase tracking-widest text-primary">
            {asset.entityType}
          </div>
          <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 pointer-events-auto shadow-xl">
             <Switch 
               checked={enabled} 
               onCheckedChange={setEnabled}
               className="data-[state=checked]:bg-green-500"
             />
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 rounded-2xl bg-black/40 border border-white/5 shadow-inner overflow-hidden flex items-center justify-center">
            {localLogo ? (
              <Image src={localLogo} alt="Logo" fill className="object-cover" />
            ) : <Icon size={20} className={cn("opacity-20", accent)} />}
            
            {logoProgress > 0 && (
              <div className="absolute inset-0 bg-primary/80 flex items-center justify-center">
                <Loader2 size={16} className="text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black uppercase tracking-tight text-white truncate">{asset.entityName}</h3>
            <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">
              Ref: {asset.entityId}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">Logo Asset</Label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-9 rounded-xl border-border bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase relative overflow-hidden">
                <Upload size={12} className="mr-1.5" /> Upload
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e, 'logo')} />
              </Button>
              {localLogo && (
                <Button variant="ghost" onClick={() => setLocalLogo(null)} className="h-9 w-9 rounded-xl text-primary p-0">
                  <Trash2 size={12} />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">Banner Asset</Label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-9 rounded-xl border-border bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase relative overflow-hidden">
                <ImageIcon size={12} className="mr-1.5" /> Upload
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e, 'banner')} />
              </Button>
              {localBanner && (
                <Button variant="ghost" onClick={() => setLocalBanner(null)} className="h-9 w-9 rounded-xl text-primary p-0">
                  <Trash2 size={12} />
                </Button>
              )}
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full h-12 bg-primary hover:bg-secondary rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 gap-2">
          {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save size={14} /> Commit Changes</>}
        </Button>
      </CardContent>
    </Card>
  );
}
