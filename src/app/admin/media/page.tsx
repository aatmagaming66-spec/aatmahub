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
  Terminal,
  FileCode
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
  const [syncing, setSyncing] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  useEffect(() => {
    console.log('[Media Hub] Starting primary stream listener...');
    const q = query(collection(db, 'media_assets'), orderBy('entityName', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setAssets(snap.docs.map(d => ({ ...d.data(), id: d.id } as MediaAsset)));
      setLoading(false);
    }, (error) => {
      console.error('[Media Hub] Snapshot error:', error);
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

        const currentMediaIds = new Set(assets.map(a => a.entityId));

        for (const col of collections) {
          const snap = await getDocs(collection(db, col.path));
          for (const d of snap.docs) {
            const data = d.data();
            if (!currentMediaIds.has(d.id)) {
              const assetRef = doc(db, 'media_assets', d.id);
              await setDoc(assetRef, {
                entityId: d.id,
                entityType: col.type,
                entityName: data.name || d.id,
                isEnabled: data.status === 'active' || data.status === 'enabled',
                logoUrl: data.icon || null,
                bannerUrl: data.banner || null,
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

    if (!loading) {
      reconcileRegistry();
    }
  }, [db, loading, assets.length]);

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
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none text-white">Media Hub</h1>
             {syncing && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
          </div>
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
          <div className="flex gap-2 bg-card p-1 rounded-2xl border border-border overflow-x-auto no-scrollbar">
            {['all', 'game', 'ott', 'social'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0",
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
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">
             {syncing ? "SYNCHRONIZING REGISTRY..." : "NO MEDIA ASSETS FOUND"}
           </p>
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

  const [isSaving, setIsSaving] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [bannerProgress, setBannerProgress] = useState(0);
  
  const [localLogo, setLocalLogo] = useState<string | null>(asset.logoUrl || null);
  const [localBanner, setLocalBanner] = useState<string | null>(asset.bannerUrl || null);
  const [enabled, setEnabled] = useState(asset.isEnabled);
  const [uncommitted, setUncommitted] = useState(false);

  // DEBUG STATE
  const [debug, setDebug] = useState({
    fileSelected: 'None',
    previewReady: false,
    uploadCalled: false,
    storageSuccess: false,
    dbSuccess: false,
    lastError: 'None'
  });

  const updateDebug = (fields: Partial<typeof debug>) => setDebug(prev => ({ ...prev, ...fields }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    console.log('FILE_PICKER_EVENT_FIRED');
    const file = e.target.files?.[0];
    if (!file) {
      console.log('FILE_SELECTION_CANCELLED');
      return;
    }

    console.log('FILE_SELECTED:', { name: file.name, size: file.size, type: file.type });
    updateDebug({ fileSelected: `${file.name} (${(file.size/1024).toFixed(1)}KB)`, lastError: 'None' });

    // 1. Validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      const err = `Invalid type: ${file.type}`;
      console.error('MEDIA_UPLOAD_FAILED:', err);
      updateDebug({ lastError: err });
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please use JPG, PNG or WEBP.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const err = `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
      console.error('MEDIA_UPLOAD_FAILED:', err);
      updateDebug({ lastError: err });
      toast({ variant: 'destructive', title: 'File Too Large', description: 'Maximum file size is 5MB.' });
      return;
    }

    // 2. Generate Preview
    const previewUrl = URL.createObjectURL(file);
    console.log('PREVIEW_GENERATED:', previewUrl);
    if (type === 'logo') setLocalLogo(previewUrl);
    else setLocalBanner(previewUrl);
    updateDebug({ previewReady: true });

    // 3. Trigger Upload Automatically
    console.log('UPLOAD_FUNCTION_CALLED');
    updateDebug({ uploadCalled: true });
    
    try {
      const storagePath = `media_assets/${asset.entityType}/${asset.entityId}/${type}_${Date.now()}`;
      const storageRef = ref(storage, storagePath);
      console.log('UPLOAD_STARTED:', storagePath);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`UPLOAD_PROGRESS (${type}): ${progress.toFixed(1)}%`);
          if (type === 'logo') setLogoProgress(progress);
          else setBannerProgress(progress);
        }, 
        (error) => {
          console.error('UPLOAD_FAILED:', error.message);
          updateDebug({ storageSuccess: false, lastError: error.message });
          toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
          if (type === 'logo') setLogoProgress(0);
          else setBannerProgress(0);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('UPLOAD_SUCCESS:', downloadURL);
          if (type === 'logo') {
            setLocalLogo(downloadURL);
            setLogoProgress(0);
          } else {
            setLocalBanner(downloadURL);
            setBannerProgress(0);
          }
          updateDebug({ storageSuccess: true });
          setUncommitted(true);
          toast({ title: 'Upload Complete', description: 'Click "Commit Changes" to finalize.' });
        }
      );
    } catch (e: any) {
      console.error('CRITICAL_UPLOAD_EXCEPTION:', e.message);
      updateDebug({ lastError: e.message });
      toast({ variant: 'destructive', title: 'System Error', description: e.message });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const assetData = {
      ...asset,
      logoUrl: localLogo,
      bannerUrl: localBanner,
      isEnabled: enabled,
      updatedAt: new Date().toISOString()
    };

    try {
      const assetRef = doc(db, 'media_assets', asset.id);
      await setDoc(assetRef, assetData, { merge: true });
      console.log('MEDIA_SAVE_SUCCESS:', asset.id);
      updateDebug({ dbSuccess: true });
      setUncommitted(false);
      toast({ title: 'Identity Committed', description: 'Registry updated successfully.' });
    } catch (e: any) {
      console.error('MEDIA_SAVE_FAILED:', e.message);
      updateDebug({ dbSuccess: false, lastError: e.message });
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const Icon = asset.entityType === 'game' ? Gamepad2 : (asset.entityType === 'ott' ? Tv : Share2);

  return (
    <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl group hover:border-primary/20 transition-all duration-500 flex flex-col">
      {/* Banner Preview Area */}
      <div className="relative aspect-video w-full bg-black/40 border-b border-white/5 flex items-center justify-center overflow-hidden">
        {localBanner ? (
          <Image 
            src={localBanner} 
            alt="Banner" 
            fill 
            className="object-cover" 
            unoptimized={localBanner.startsWith('blob:')}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-10">
            <ImageIcon size={40} className="text-white" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Empty Banner</span>
          </div>
        )}
        
        {bannerProgress > 0 && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 gap-2 z-20">
            <Progress value={bannerProgress} className="h-1 bg-white/10" />
            <span className="text-[8px] font-black text-white uppercase tracking-widest">{bannerProgress.toFixed(0)}% TRANSMITTING...</span>
          </div>
        )}

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md p-1 px-3 rounded-lg border border-white/10 text-[7px] font-black uppercase tracking-widest text-primary">
            {asset.entityType}
          </div>
          <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 pointer-events-auto shadow-xl">
             <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
        {/* Logo and Identity */}
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 rounded-2xl bg-black/40 border border-white/5 shadow-inner overflow-hidden flex items-center justify-center">
            {localLogo ? (
              <Image 
                src={localLogo} 
                alt="Logo" 
                fill 
                className="object-cover" 
                unoptimized={localLogo.startsWith('blob:')}
              />
            ) : <Icon size={20} className="opacity-20 text-primary" />}
            
            {logoProgress > 0 && (
              <div className="absolute inset-0 bg-primary/80 flex items-center justify-center">
                <Loader2 size={16} className="text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black uppercase tracking-tight text-white truncate">{asset.entityName}</h3>
            <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">ID: {asset.entityId}</p>
          </div>
        </div>

        {/* Upload Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">Logo File</Label>
            <Button variant="outline" className="w-full h-9 rounded-xl border-border bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase relative overflow-hidden">
              <Upload size={12} className="mr-1.5" /> Select Logo
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e, 'logo')} onClick={(e) => console.log('LOGO_PICKER_CLICKED')} />
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">Banner File</Label>
            <Button variant="outline" className="w-full h-9 rounded-xl border-border bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase relative overflow-hidden">
              <ImageIcon size={12} className="mr-1.5" /> Select Banner
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e, 'banner')} onClick={(e) => console.log('BANNER_PICKER_CLICKED')} />
            </Button>
          </div>
        </div>

        {uncommitted && (
          <div className="bg-primary/10 border border-primary/20 p-2 rounded-xl flex items-center gap-2 animate-pulse">
            <AlertCircle size={10} className="text-primary" />
            <span className="text-[8px] font-black text-primary uppercase">Uncommitted Changes Detected</span>
          </div>
        )}

        <Button 
          onClick={handleSave} 
          disabled={isSaving || logoProgress > 0 || bannerProgress > 0} 
          className="w-full h-12 bg-primary hover:bg-secondary rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 gap-2 mt-auto"
        >
          {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save size={14} /> Commit Changes</>}
        </Button>

        {/* DEBUG PANEL */}
        <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5">
           <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
             <Terminal size={10} />
             <span className="text-[8px] font-black uppercase tracking-widest">Debug Protocol</span>
           </div>
           <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <DebugLine label="File" value={debug.fileSelected} />
              <DebugLine label="Preview" value={debug.previewReady ? 'Ready' : 'Pending'} success={debug.previewReady} />
              <DebugLine label="Upload" value={debug.uploadCalled ? 'Started' : 'Idle'} success={debug.uploadCalled} />
              <DebugLine label="Storage" value={debug.storageSuccess ? 'Verified' : 'Pending'} success={debug.storageSuccess} />
              <DebugLine label="Registry" value={debug.dbSuccess ? 'Synced' : 'Pending'} success={debug.dbSuccess} />
              <DebugLine label="Status" value={debug.lastError === 'None' ? 'Healthy' : 'Error'} error={debug.lastError !== 'None'} />
           </div>
           {debug.lastError !== 'None' && (
             <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-[7px] font-mono text-red-400 break-all">{debug.lastError}</p>
             </div>
           )}
        </div>
      </CardContent>
    </Card>
  );
}

function DebugLine({ label, value, success, error }: { label: string, value: string, success?: boolean, error?: boolean }) {
  return (
    <div className="flex justify-between items-center gap-2 overflow-hidden">
      <span className="text-[7px] font-black uppercase opacity-40">{label}:</span>
      <span className={cn(
        "text-[7px] font-bold uppercase truncate",
        success ? "text-green-500" : (error ? "text-primary" : "text-white/60")
      )}>{value}</span>
    </div>
  );
}
