'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useStorage } from '@/firebase/provider';
import { 
  collection, 
  query, 
  doc, 
  updateDoc, 
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Upload, 
  RefreshCcw, 
  Trash2, 
  Save, 
  Gamepad2, 
  Tv, 
  Share2, 
  Palette,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface DynamicEntity {
  id: string;
  name: string;
  type: 'game' | 'ott' | 'social' | 'branding';
  status: string;
  icon?: string;
  banner?: string;
  updatedAt?: string;
  collectionName: string;
}

export default function MediaManagerPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Real-time states for collections
  const [games, setGames] = useState<DynamicEntity[]>([]);
  const [ott, setOtt] = useState<DynamicEntity[]>([]);
  const [social, setSocial] = useState<DynamicEntity[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    // 1. Listen to Games
    const unsubGames = onSnapshot(collection(db, 'games'), (snap) => {
      setGames(snap.docs.map(d => ({ ...d.data(), id: d.id, type: 'game', collectionName: 'games' } as DynamicEntity)));
    });

    // 2. Listen to OTT
    const unsubOtt = onSnapshot(collection(db, 'ott_services'), (snap) => {
      setOtt(snap.docs.map(d => ({ ...d.data(), id: d.id, type: 'ott', collectionName: 'ott_services' } as DynamicEntity)));
    });

    // 3. Listen to Social
    const unsubSocial = onSnapshot(collection(db, 'social_services'), (snap) => {
      setSocial(snap.docs.map(d => ({ ...d.data(), id: d.id, type: 'social', collectionName: 'social_services' } as DynamicEntity)));
    });

    // 4. Listen to Site Branding
    const unsubSite = onSnapshot(doc(db, 'settings', 'site'), (snap) => {
      if (snap.exists()) setSiteSettings({ ...snap.data(), id: 'site', type: 'branding', collectionName: 'settings' });
      setLoading(false);
    });

    return () => {
      unsubGames();
      unsubOtt();
      unsubSocial();
      unsubSite();
    };
  }, [db]);

  const filterItems = (items: DynamicEntity[]) => 
    items.filter(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredGames = useMemo(() => filterItems(games), [games, searchQuery]);
  const filteredOtt = useMemo(() => filterItems(ott), [ott, searchQuery]);
  const filteredSocial = useMemo(() => filterItems(social), [social, searchQuery]);

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
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none text-white">Media Manager 2.0</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60 mt-2">Dynamic Asset Distribution</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search catalog entities..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card border-border pl-12 h-14 rounded-2xl text-xs font-bold focus:border-primary shadow-xl ring-0"
          />
        </div>
      </header>

      {/* 1. BRANDING SECTION */}
      {siteSettings && !searchQuery && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-primary"><Palette size={18} /></div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Site Branding</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BrandingCard settings={siteSettings} />
          </div>
        </section>
      )}

      {/* 2. GAMES SECTION */}
      <MediaSection 
        title="Mobile Games Catalog" 
        icon={Gamepad2} 
        items={filteredGames}
        accent="text-accent"
      />

      {/* 3. OTT SERVICES SECTION */}
      <MediaSection 
        title="OTT Distribution" 
        icon={Tv} 
        items={filteredOtt}
        accent="text-primary"
      />

      {/* 4. SOCIAL SERVICES SECTION */}
      <MediaSection 
        title="Social Growth Hub" 
        icon={Share2} 
        items={filteredSocial}
        accent="text-accent"
      />

      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Media Protocol</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          Changes to media assets are committed to the specific entity record in Firestore. Logo resolution: 256x256px. Banner resolution: 1200x400px.
        </p>
      </div>
    </div>
  );
}

function MediaSection({ title, icon: Icon, items, accent }: any) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-6 pt-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className={cn("h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center", accent)}>
            <Icon size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">{title}</h2>
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{items.length} Entities</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item: DynamicEntity) => (
          <EntityMediaCard key={item.id} entity={item} />
        ))}
      </div>
    </section>
  );
}

function EntityMediaCard({ entity }: { entity: DynamicEntity }) {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [bannerProgress, setBannerProgress] = useState(0);
  
  // Local previews
  const [localIcon, setLocalIcon] = useState<string | null>(entity.icon || null);
  const [localBanner, setLocalBanner] = useState<string | null>(entity.banner || null);
  const [isEnabled, setIsEnabled] = useState(entity.status === 'active' || entity.status === 'enabled');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const storagePath = `media/${entity.collectionName}/${entity.id}/${type}_${Date.now()}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (type === 'icon') setLogoProgress(progress);
        else setBannerProgress(progress);
      }, 
      (error) => {
        toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        if (type === 'icon') {
          setLocalIcon(downloadURL);
          setLogoProgress(0);
        } else {
          setLocalBanner(downloadURL);
          setBannerProgress(0);
        }
        toast({ title: 'Media Buffered', description: 'Press Save to commit changes.' });
      }
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const entityRef = doc(db, entity.collectionName, entity.id);
      const data: any = {
        icon: localIcon,
        banner: localBanner,
        status: isEnabled ? (entity.collectionName === 'regions' ? 'enabled' : 'active') : (entity.collectionName === 'regions' ? 'disabled' : 'inactive'),
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(entityRef, data);
      toast({ title: 'Entity Synchronized', description: `${entity.name} media updated.` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl group hover:border-primary/20 transition-all duration-500">
      {/* BANNER PREVIEW AREA */}
      <div className="relative aspect-video w-full bg-black/40 border-b border-white/5 flex items-center justify-center overflow-hidden">
        {localBanner ? (
          <Image src={localBanner} alt="Banner" fill className="object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-10">
            <ImageIcon size={40} className="text-white" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">No Banner</span>
          </div>
        )}
        
        {bannerProgress > 0 && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 gap-2 z-20">
            <Progress value={bannerProgress} className="h-1 bg-white/10" />
            <span className="text-[8px] font-black text-white uppercase tracking-widest">Uploading Banner...</span>
          </div>
        )}

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md p-1 px-3 rounded-lg border border-white/10 text-[8px] font-black uppercase tracking-widest text-primary">
            {entity.type} Entity
          </div>
          <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 pointer-events-auto shadow-xl">
             <Switch 
               checked={isEnabled} 
               onCheckedChange={setIsEnabled}
               className="data-[state=checked]:bg-green-500"
             />
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 rounded-2xl bg-black/40 border border-white/5 shadow-inner overflow-hidden flex items-center justify-center">
            {localIcon ? (
              <Image src={localIcon} alt="Logo" fill className="object-cover" />
            ) : <ImageIcon size={20} className="text-white/10" />}
            
            {logoProgress > 0 && (
              <div className="absolute inset-0 bg-primary/80 flex items-center justify-center">
                <Loader2 size={16} className="text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black uppercase tracking-tight text-white truncate">{entity.name}</h3>
            <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">
              Ref: {entity.id}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">Logo Asset</Label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-9 rounded-xl border-border bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase relative overflow-hidden">
                <Upload size={12} className="mr-1.5" /> Change
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e, 'icon')} />
              </Button>
              {localIcon && (
                <Button variant="ghost" onClick={() => setLocalIcon(null)} className="h-9 w-9 rounded-xl text-primary p-0">
                  <Trash2 size={12} />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">Banner Asset</Label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-9 rounded-xl border-border bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase relative overflow-hidden">
                <ImageIcon size={12} className="mr-1.5" /> Change
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e, 'banner')} />
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
          {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save size={14} /> Commit Dynamic Changes</>}
        </Button>
      </CardContent>
    </Card>
  );
}

function BrandingCard({ settings }: { settings: any }) {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [heroUrl, setHeroUrl] = useState(settings.heroUrl || '');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const storageRef = ref(storage, `branding/${field}_${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', null, 
      (err) => toast({ variant: 'destructive', title: 'Error', description: err.message }),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        if (field === 'logoUrl') setLogoUrl(url);
        else setHeroUrl(url);
        toast({ title: 'Identity Uploaded' });
      }
    );
  };

  const saveBranding = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'settings', 'site'), { logoUrl, heroUrl, updatedAt: new Date().toISOString() });
      toast({ title: 'Site Identity Updated' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl">
      <div className="relative aspect-[3/1] bg-black/40 border-b border-white/5 flex items-center justify-center">
        {heroUrl ? <Image src={heroUrl} alt="Hero" fill className="object-cover opacity-50" /> : <Globe size={40} className="text-white/10" />}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">AATMA HUB BRANDING</span>
        </div>
      </div>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative">
              {logoUrl ? <Image src={logoUrl} alt="Logo" fill className="object-contain" /> : <Palette size={20} className="text-primary" />}
           </div>
           <div>
             <h3 className="text-sm font-black uppercase tracking-tight">Main Identity</h3>
             <p className="text-[8px] text-muted-foreground uppercase font-black">Site Logo & Master Hero</p>
           </div>
        </div>

        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-10 rounded-xl text-[8px] font-black uppercase relative overflow-hidden">
                Update Logo <input type="file" className="absolute inset-0 opacity-0" onChange={(e) => handleUpload(e, 'logoUrl')} />
              </Button>
              <Button variant="outline" className="h-10 rounded-xl text-[8px] font-black uppercase relative overflow-hidden">
                Update Hero <input type="file" className="absolute inset-0 opacity-0" onChange={(e) => handleUpload(e, 'heroUrl')} />
              </Button>
           </div>
           <Button onClick={saveBranding} disabled={isSaving} className="w-full h-12 bg-primary font-black uppercase text-[10px] rounded-2xl shadow-xl shadow-primary/20">
             {isSaving ? <Loader2 className="animate-spin" /> : 'Save Global Branding'}
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}
