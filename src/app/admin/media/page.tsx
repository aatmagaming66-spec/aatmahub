'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useStorage } from '@/firebase/provider';
import { 
  collection, 
  query, 
  doc, 
  setDoc, 
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Upload, 
  Save, 
  ImageIcon,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MediaAsset {
  id: string;
  entityId: string;
  entityType: string;
  entityName: string;
  logoUrl: string;
  bannerUrl: string;
  thumbnailUrl: string;
  imageUrl?: string;
}

export default function MediaHub() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'media_assets'), orderBy('entityId', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as MediaAsset));
      setAssets(data);
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

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase text-white">Media Registry</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Asset Distribution Management</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input placeholder="Search entities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-card border-border pl-10 h-12 rounded-2xl text-xs font-bold focus:border-primary shadow-xl ring-0 w-full outline-none" />
          </div>
          <div className="flex gap-2 bg-card p-1 rounded-2xl border border-border">
            {['all', 'game', 'ott', 'social'].map((t) => (
              <button key={t} onClick={() => setFilterType(t)} className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", filterType === t ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white")}>{t}</button>
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

  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState<{ [key: string]: number }>({ logo: 0, banner: 0 });
  const [form, setForm] = useState({
    logoUrl: asset.logoUrl || '',
    bannerUrl: asset.bannerUrl || '',
    thumbnailUrl: asset.thumbnailUrl || ''
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const path = `media_assets/${asset.entityType}/${asset.entityId}/${type}_${Date.now()}`;
      const sRef = ref(storage, path);
      const task = uploadBytesResumable(sRef, file);

      task.on('state_changed', 
        (snap) => setUploads(v => ({ ...v, [type]: (snap.bytesTransferred / snap.totalBytes) * 100 })),
        (err) => toast({ variant: 'destructive', title: 'Upload Failed', description: err.message }),
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          const field = type === 'logo' ? 'logoUrl' : type === 'banner' ? 'bannerUrl' : 'thumbnailUrl';
          setForm(v => ({ ...v, [field]: url }));
          setUploads(v => ({ ...v, [type]: 0 }));
          toast({ title: 'Transfer Complete' });
        }
      );
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'System Error', description: e.message });
    }
  };

  const handleCommit = async () => {
    setSaving(true);
    try {
      // Final sanitization check: Do not allow blob URLs to be saved to the database
      const sanitizedLogo = form.logoUrl.startsWith('blob:') ? '' : form.logoUrl;
      const sanitizedBanner = form.bannerUrl.startsWith('blob:') ? '' : form.bannerUrl;

      const data = {
        ...asset,
        logoUrl: sanitizedLogo,
        bannerUrl: sanitizedBanner,
        imageUrl: sanitizedLogo, // Standard field for marketplace
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'media_assets', asset.id), data, { merge: true });
      toast({ title: 'Registry Updated' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Commit Failed', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl flex flex-col group hover:border-primary/20 transition-all">
      <div className="relative aspect-video bg-neutral-900 border-b border-white/5 flex items-center justify-center overflow-hidden">
        {form.bannerUrl && !form.bannerUrl.startsWith('blob:') ? (
          <img src={form.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : <ImageIcon size={40} className="opacity-10" />}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[7px] font-black uppercase text-primary border border-white/10">
          {asset.entityType}
        </div>
      </div>

      <CardContent className="p-6 space-y-6 flex-1">
        <div className="flex items-center gap-4">
          <div className="h-16 w-12 rounded-xl bg-black/60 border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
            {form.logoUrl && !form.logoUrl.startsWith('blob:') ? <img src={form.logoUrl} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="opacity-20" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black uppercase tracking-tight text-white truncate">{asset.entityName}</h3>
            <p className="text-[7px] text-white/20 font-mono truncate">REF: {asset.entityId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">Logo (2:3)</Label>
            <Button variant="outline" className="w-full h-10 rounded-xl bg-white/5 border-border text-[8px] font-black uppercase relative overflow-hidden">
              <Upload size={12} className="mr-1" /> {uploads.logo > 0 ? `${Math.round(uploads.logo)}%` : 'Select'}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e, 'logo')} />
            </Button>
            {uploads.logo > 0 && <Progress value={uploads.logo} className="h-1" />}
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">Banner (16:9)</Label>
            <Button variant="outline" className="w-full h-10 rounded-xl bg-white/5 border-border text-[8px] font-black uppercase relative overflow-hidden">
              <ImageIcon size={12} className="mr-1" /> {uploads.banner > 0 ? `${Math.round(uploads.banner)}%` : 'Select'}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e, 'banner')} />
            </Button>
            {uploads.banner > 0 && <Progress value={uploads.banner} className="h-1" />}
          </div>
        </div>

        <Button onClick={handleCommit} disabled={saving} className="w-full h-12 bg-primary hover:bg-secondary rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 gap-2">
          {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save size={14} /> Commit to Hub</>}
        </Button>
      </CardContent>
    </Card>
  );
}