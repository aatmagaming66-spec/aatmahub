'use client';

import { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, setDoc, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Loader2, Search, Gamepad2, Image as ImageIcon, CheckCircle2, Layers, X, Bug, Globe, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const CATEGORIES = ["Mobile Games", "OTT Services", "Social Services"];
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dynduenfb/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "aatmahub_upload";

export default function GameManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('registry');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    slug: '',
    category: 'Mobile Games',
    status: 'active',
    sortOrder: 0,
    logo: '',
    banner: '',
    flag: ''
  });

  const [files, setFiles] = useState<{ logo: File | null, banner: File | null }>({ logo: null, banner: null });

  const gamesQuery = useMemo(() => query(collection(db, 'games'), orderBy('sortOrder', 'asc')), [db]);
  const { data: games, loading } = useCollection(gamesQuery);

  const regionsRef = useMemo(() => collection(db, 'regions'), [db]);
  const { data: regions, loading: regionsLoading } = useCollection(regionsRef);

  const filteredGames = useMemo(() => {
    if (!games) return [];
    return games.filter(g => 
      g.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [games, searchQuery]);

  const generateSlug = (name: string) => {
    return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleOpenModal = (game: any = null) => {
    if (game) {
      setEditingGame(game);
      setFormData({
        id: game.id || '',
        name: game.name || '',
        slug: game.slug || game.id || '',
        category: game.category || 'Mobile Games',
        status: game.status || 'active',
        sortOrder: game.sortOrder || 0,
        logo: game.logo || '',
        banner: game.banner || '',
        flag: game.flag || ''
      });
    } else {
      setEditingGame(null);
      setFormData({
        id: '', name: '', slug: '', category: 'Mobile Games', status: 'active',
        sortOrder: (games?.length || 0) + 1,
        logo: '', banner: '', flag: ''
      });
    }
    setFiles({ logo: null, banner: null });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      fd.append("folder", "aatmahub");
      const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: fd });
      if (!res.ok) throw new Error('Cloudinary rejection');
      return await res.json();
    } catch (error: any) { throw error; }
  };

  const handleSave = async () => {
    const cleanName = formData.name?.trim();
    const cleanSlug = formData.slug?.trim();
    
    if (!cleanName || !cleanSlug) {
      toast({ variant: 'destructive', title: 'Error', description: 'Name and Slug are required.' });
      return;
    }

    setSaving(true);
    try {
      const gId = formData.id || cleanSlug;
      let logoUrl = formData.logo;
      let bannerUrl = formData.banner;

      if (files.logo) {
        const data = await handleFileUpload(files.logo);
        logoUrl = data.secure_url;
      }
      if (files.banner) {
        const data = await handleFileUpload(files.banner);
        bannerUrl = data.secure_url;
      }

      const gameRef = doc(db, 'games', gId);
      const existing = games?.find(g => g.id === gId);
      
      const payload = { 
        id: gId, 
        name: cleanName, 
        slug: cleanSlug, 
        category: formData.category, 
        status: formData.status,
        sortOrder: Number(formData.sortOrder), 
        logo: logoUrl, 
        banner: bannerUrl,
        flag: formData.flag,
        updatedAt: new Date().toISOString(), 
        createdAt: existing?.createdAt || new Date().toISOString()
      };
      
      await setDoc(gameRef, payload, { merge: true });
      
      toast({ title: 'Success', description: `${cleanName} has been updated.` });
      setIsModalOpen(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Operation Failed', description: e.message });
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this record?')) return;
    try { await deleteDoc(doc(db, 'games', id)); toast({ title: 'Success' }); } catch (e: any) { toast({ variant: 'destructive', title: 'Error', description: e.message }); }
  };

  const toggleRegion = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
      await updateDoc(doc(db, 'regions', id), { status: newStatus });
      toast({ title: "Updated", description: `${id} is now ${newStatus}.` });
    } catch (error: any) { toast({ variant: 'destructive', title: "Update Failed", description: error.message }); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase text-white">Registry Hub</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Manage Content & Regional Grid</p>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card border border-border h-14 p-1.5 rounded-none mb-8 w-full max-w-md">
          <TabsTrigger value="registry" className="flex-1 text-[10px] font-black uppercase rounded-none data-[state=active]:bg-primary">Catalog</TabsTrigger>
          <TabsTrigger value="regions" className="flex-1 text-[10px] font-black uppercase rounded-none data-[state=active]:bg-primary">Regions</TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className="space-y-6">
          <div className="flex justify-between items-center gap-4">
             <div className="relative flex-1 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input placeholder="Search catalog..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-card border-border pl-12 h-12 rounded-none text-xs font-bold focus:border-primary shadow-xl" />
             </div>
             <Button onClick={() => handleOpenModal()} className="bg-primary h-12 rounded-none font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 gap-2">
                <Plus size={16} /> Add Product
             </Button>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <Card key={game.id} className="bg-card border-border rounded-none overflow-hidden shadow-2xl relative group hover:border-primary/20 transition-all">
                  <div className="aspect-video relative bg-neutral-900 border-b border-border">
                    {game.banner ? <Image src={game.banner} alt={game.name} fill className="object-cover" /> : <div className="flex items-center justify-center h-full"><ImageIcon size={40} className="text-white/10" /></div>}
                    <div className="absolute top-4 left-4 h-12 w-12 rounded-none bg-black/60 backdrop-blur-md border border-white/10 overflow-hidden">{game.logo && <Image src={game.logo} alt={game.name} fill className="object-cover" />}</div>
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                      <div className={`px-2 py-0.5 rounded-none text-[7px] font-black uppercase border shadow-lg ${game.status === 'active' ? 'bg-green-500 border-green-400 text-white' : 'bg-primary border-primary/50 text-white'}`}>{game.status}</div>
                      <div className="bg-black/80 px-2 py-0.5 rounded-none border border-white/10 text-[7px] font-black uppercase text-white/60">{game.category}</div>
                      {game.flag && <div className="bg-black/80 px-2 py-0.5 rounded-none border border-white/10 text-[10px]">{game.flag}</div>}
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-black uppercase tracking-tight text-white">{game.name}</h3>
                      <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest leading-none">Slug: {game.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleOpenModal(game)} className="flex-1 border-border h-10 rounded-none text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-white/5"><Edit2 size={12} /> Edit</Button>
                      <Button variant="outline" onClick={() => handleDelete(game.id)} className="border-primary/20 text-primary hover:bg-primary/5 h-10 w-10 rounded-none flex items-center justify-center"><Trash2 size={14} /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <div className="bg-accent/5 p-6 rounded-none border border-accent/10 space-y-3 max-w-2xl mb-6">
            <div className="flex items-center gap-2 text-accent"><Globe className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">Regional Hub</span></div>
            <p className="text-[11px] text-muted-foreground font-medium uppercase leading-relaxed tracking-wider">Manage regional availability and distribution grids.</p>
          </div>
          {regionsLoading ? (
            <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regions?.map((region) => (
                <Card key={region.id} className="bg-card border-border rounded-none overflow-hidden shadow-2xl relative group hover:border-primary/20 transition-all">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl bg-black/40 h-14 w-14 rounded-none flex items-center justify-center border border-white/5">{region.flag || '🌐'}</div>
                        <div><h3 className="text-sm font-black uppercase tracking-tight">{region.name}</h3><p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{region.id}</p></div>
                      </div>
                      <div className={`px-2 py-1 rounded-none text-[7px] font-black uppercase tracking-tighter border ${region.status === 'enabled' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-primary/10 text-primary border-primary/10'}`}>{region.status}</div>
                    </div>
                    <div className="pt-6 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2"><ShieldCheck className={`h-4 w-4 ${region.status === 'enabled' ? 'text-green-500' : 'text-muted-foreground'}`} /><span className="text-[10px] font-black uppercase tracking-widest">Active Status</span></div>
                      <Switch checked={region.status === 'enabled'} onCheckedChange={() => toggleRegion(region.id, region.status)} className="data-[state=checked]:bg-green-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border rounded-none p-8 max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-tighter text-white">{editingGame ? 'Edit Registry' : 'New Entry'}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
             <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Product Name</Label>
                <input 
                  value={formData.name} 
                  onChange={(e) => { 
                    const name = e.target.value; 
                    const slug = editingGame ? formData.slug : generateSlug(name); 
                    setFormData({...formData, name, slug}); 
                  }} 
                  placeholder="e.g. MLBB India" 
                  className="bg-black/50 border-border h-12 rounded-none text-xs font-bold focus:border-primary w-full px-4 outline-none" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Unique Slug (ID)</Label>
                <input 
                  value={formData.slug} 
                  onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                  placeholder="mlbb-india" 
                  className="bg-black/50 border-border h-12 rounded-none text-xs font-bold focus:border-primary w-full px-4 outline-none" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Category Hub</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                  <SelectTrigger className="bg-black/50 border-border h-12 rounded-none focus:border-primary font-bold"><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-none">
                    {CATEGORIES.map(cat => <SelectItem key={cat} value={cat} className="text-[10px] font-black uppercase">{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Priority Index</Label>
                <input type="number" value={formData.sortOrder} onChange={(e) => setFormData({...formData, sortOrder: Number(e.target.value)})} className="bg-black/50 border-border h-12 rounded-none text-xs font-bold w-full px-4 outline-none" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Regional Flag (Emoji)</Label>
              <input 
                value={formData.flag} 
                onChange={(e) => setFormData({...formData, flag: e.target.value})} 
                placeholder="🇮🇳, 🇮🇩..." 
                className="bg-black/50 border-border h-12 rounded-none text-sm font-bold focus:border-primary w-full px-4 outline-none" 
              />
            </div>

            <div className="flex items-center justify-between bg-black/50 border border-border h-12 rounded-none px-4">
              <span className="text-[10px] font-bold uppercase text-white/60">Operational Status</span>
              <Switch checked={formData.status === 'active'} onCheckedChange={(v) => setFormData({...formData, status: v ? 'active' : 'inactive'})} />
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-none space-y-3">
                 <div className="flex items-center gap-2"><ImageIcon size={14} className="text-primary" /><span className="text-[10px] font-black uppercase tracking-widest">Logo Resource</span></div>
                 <input type="file" onChange={(e) => setFiles({...files, logo: e.target.files?.[0] || null})} className="text-[8px]" accept=".jpg,.jpeg,.png,.webp" />
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-none space-y-3">
                 <div className="flex items-center gap-2"><ImageIcon size={14} className="text-accent" /><span className="text-[10px] font-black uppercase tracking-widest">Banner Resource</span></div>
                 <input type="file" onChange={(e) => setFiles({...files, banner: e.target.files?.[0] || null})} className="text-[8px]" accept=".jpg,.jpeg,.png,.webp" />
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-none p-4 space-y-2">
               <div className="flex items-center gap-2 text-primary">
                 <Bug size={12} />
                 <span className="text-[9px] font-black uppercase tracking-widest">State Debug</span>
               </div>
               <div className="grid grid-cols-2 gap-2 text-[8px] font-mono uppercase text-white/40">
                  <p>Name: <span className="text-white">{formData.name || 'NULL'}</span></p>
                  <p>Slug: <span className="text-white">{formData.slug || 'NULL'}</span></p>
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-none font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
              {saving ? <Loader2 className="animate-spin" /> : "Commit Registry Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}