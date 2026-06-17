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
  getDocs
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Upload, 
  Save, 
  Gamepad2, 
  Tv, 
  Share2, 
  ImageIcon,
  Loader2,
  AlertCircle
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
  thumbnailUrl?: string; 
  imageUrl?: string; 
  icon?: string;     
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
  const [syncing, setSyncing] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'media_assets'), orderBy('entityName', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as MediaAsset));
      setAssets(data);
      setLoading(false);
    }, (error) => {
      toast({ variant: 'destructive', title: 'Connection Error', description: error.message });
    });
    return () => unsubscribe();
  }, [db, toast]);

  useEffect(() => {
    async function reconcileRegistry() {
      if (syncing) return;
      setSyncing(true);
      try {
        const collections = [
          { path: 'games', type: 'game' },
          { path: 'ott_services', type: 'ott' },
          { path: 'social_services', type: 'social' }
        ];
        
        for (const col of collections) {
          const snap = await getDocs(collection(db, col.path));
          for (const d of snap.docs) {
            const data = d.data();
            const existingAsset = assets.find(a => a.entityId === d.id);
            const needsUpdate = !existingAsset || (!existingAsset.logoUrl && (data.cardImage || data.icon || data.logoUrl));

            if (needsUpdate) {
              const assetRef = doc(db, 'media_assets', d.id);
              const existingImage = data.logoUrl || data.cardImage || data.icon || data.thumbnail || data.imageUrl || null;
              const existingBanner = data.bannerUrl || data.banner || null;

              await setDoc(assetRef, {
                entityId: d.id,
                entityType: col.type,
                entityName: data.name || d.id,
                isEnabled: data.status === 'active' || data.status === 'enabled',
                logoUrl: existingImage,
                thumbnailUrl: existingImage,
                imageUrl: existingImage,
                icon: existingImage,
                bannerUrl: existingBanner,
                updatedAt: new Date().toISOString()
              }, { merge: true });
            }
          }
        }
      } catch (e: any) {
        console.error('[Media Hub] Auto-sync failure:', e);
      } finally {
        setSyncing(false);
      }
    }
    if (!loading) reconcileRegistry();
  }, [db, loading, assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = a.entityName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || a.entityType === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [assets, searchQuery, filterType]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-headline font-black tracking-tighter uppercase text-white">Media Hub</h1>
             {syncing && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60 mt-2">Protocol: Database-Driven Asset Pipeline</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input placeholder="Search assets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-card border-border pl-10 h-12 rounded-2xl text-xs font-bold focus:border-primary shadow-xl ring-0 w-full outline-none" />
          </div>
          <div className="flex gap-2 bg-card p-1 rounded-2xl border border-border overflow-x-auto no-scrollbar">
            {['all', 'game', 'ott', 'social'].map((t) => (
              <button key={t} onClick={() => setFilterType(t as any)} className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0", filterType === t ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white")}>{t}</button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <MediaAssetCard key={asset.id} asset={asset} />
        ))}
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
  
  const [localLogo, setLocalLogo] = useState<string | null>(null);
  const [localBanner, setLocalBanner] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(asset.isEnabled);
  const [uncommitted, setUncommitted] = useState(false);

  useEffect(() => {
    if (!uncommitted) {
      setLocalLogo(asset.logoUrl || asset.thumbnailUrl || asset.icon || asset.imageUrl || null);
      setLocalBanner(asset.bannerUrl || null);
      setEnabled(asset.isEnabled);
    }
  }, [asset, uncommitted]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File Too Large', description: 'Maximum file size is 5MB.' });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === 'logo') setLocalLogo(previewUrl);
    else setLocalBanner(previewUrl);

    try {
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
          if (type === 'logo') { setLocalLogo(downloadURL); setLogoProgress(0); }
          else { setLocalBanner(downloadURL); setBannerProgress(0); }
          setUncommitted(true);
          toast({ title: 'Upload Ready', description: 'Commit changes to finalize.' });
        }
      );
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'System Error', description: e.message });
    }
  };

  const handleSave = async () => {
    if (localLogo?.startsWith('blob:') || localBanner?.startsWith('blob:')) {
      toast({ variant: 'destructive', title: 'Save Blocked', description: 'Upload still in progress.' });
      return;
    }

    setIsSaving(true);
    const assetData = {
      entityId: asset.entityId || asset.id,
      entityType: asset.entityType,
      entityName: asset.entityName,
      logoUrl: localLogo,
      thumbnailUrl: localLogo, 
      imageUrl: localLogo,
      icon: localLogo,
      bannerUrl: localBanner,
      isEnabled: enabled,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'media_assets', asset.id), assetData, { merge: true });
      setUncommitted(false);
      toast({ title: 'Identity Committed' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally { 
      setIsSaving(false); 
    }
  };

  const Icon = asset.entityType === 'game' ? Gamepad2 : (asset.entityType === 'ott' ? Tv : Share2);

  return (
    <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl group hover:border-primary/20 transition-all flex flex-col">
      <div className="relative aspect-video w-full bg-black/40 border-b border-white/5 flex items-center justify-center overflow-hidden">
        {localBanner ? (
          <Image src={localBanner} alt="Banner" fill className="object-cover" unoptimized={localBanner.startsWith('blob:')} />
        ) : <div className="flex flex-col items-center gap-2 opacity-10"><ImageIcon size={40} /><span className="text-[8px] font-black uppercase tracking-[0.3em]">No Banner</span></div>}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md p-1 px-3 rounded-lg border border-white/10 text-[7px] font-black uppercase text-primary">{asset.entityType}</div>
          <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 pointer-events-auto shadow-xl"><Switch checked={enabled} onCheckedChange={setEnabled} /></div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
        <div className="flex items-center gap-4">
          <div className="relative aspect-[2/3] h-20 shrink-0 rounded-xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center">
            {localLogo ? <Image src={localLogo} alt="Logo" fill className="object-cover" unoptimized={localLogo.startsWith('blob:')} /> : <Icon size={20} className="opacity-20 text-primary" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black uppercase tracking-tight text-white truncate">{asset.entityName}</h3>
            <p className="text-[7px] text-white/20 font-mono uppercase truncate">REF: {asset.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">Logo</Label>
            <Button variant="outline" className="w-full h-9 rounded-xl border-border bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase relative overflow-hidden">
              <Upload size={12} className="mr-1.5" /> Select
              <input type="file" accept="image/jpeg,image/png,image/webp" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e, 'logo')} />
            </Button>
            {logoProgress > 0 && <Progress value={logoProgress} className="h-1" />}
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">Banner</Label>
            <Button variant="outline" className="w-full h-9 rounded-xl border-border bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase relative overflow-hidden">
              <ImageIcon size={12} className="mr-1.5" /> Select
              <input type="file" accept="image/jpeg,image/png,image/webp" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e, 'banner')} />
            </Button>
            {bannerProgress > 0 && <Progress value={bannerProgress} className="h-1" />}
          </div>
        </div>

        {uncommitted && (
          <div className="bg-primary/10 border border-primary/20 p-2 rounded-xl flex items-center gap-2">
            <AlertCircle size={10} className="text-primary" />
            <span className="text-[8px] font-black text-primary uppercase">Uncommitted Changes</span>
          </div>
        )}

        <Button onClick={handleSave} disabled={isSaving || logoProgress > 0 || bannerProgress > 0} className="w-full h-12 bg-primary hover:bg-secondary rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 gap-2 mt-auto">
          {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save size={14} /> Commit Changes</>}
        </Button>
      </CardContent>
    </Card>
  );
}
