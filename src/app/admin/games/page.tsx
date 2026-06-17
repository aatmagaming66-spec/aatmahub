
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useStorage } from '@/firebase/provider';
import { collection, setDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Edit2, Trash2, Loader2, Search, Gamepad2, Image as ImageIcon, CheckCircle2, Tag, Layers, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const CATEGORIES = ["Mobile Games", "OTT Services", "Social Services"];

export default function CatalogManagementPage() {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  
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
    tabs: [] as string[]
  });

  const [newTab, setNewTab] = useState('');

  const [files, setFiles] = useState<{ logo: File | null, banner: File | null }>({
    logo: null,
    banner: null
  });

  const gamesQuery = useMemo(() => query(collection(db, 'games'), orderBy('sortOrder', 'asc')), [db]);
  const { data: games, loading } = useCollection(gamesQuery);

  const filteredGames = useMemo(() => {
    if (!games) return [];
    return games.filter(g => 
      g.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [games, searchQuery]);

  const handleOpenModal = (game: any = null) => {
    if (game) {
      setEditingGame(game);
      setFormData({
        id: game.id || '',
        name: game.name || '',
        slug: game.slug || '',
        category: game.category || 'Mobile Games',
        status: game.status || 'active',
        sortOrder: game.sortOrder || 0,
        logo: game.logo || '',
        banner: game.banner || '',
        tabs: game.tabs || ['small', 'large', 'pass', 'promo']
      });
    } else {
      setEditingGame(null);
      setFormData({
        id: '', name: '', slug: '', category: 'Mobile Games', status: 'active',
        sortOrder: (games?.length || 0) + 1,
        logo: '', banner: '', tabs: ['small', 'large', 'pass', 'promo']
      });
    }
    setFiles({ logo: null, banner: null });
    setNewTab('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File, path: string) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const addTab = () => {
    if (!newTab || formData.tabs.includes(newTab.toLowerCase())) return;
    setFormData({ ...formData, tabs: [...formData.tabs, newTab.toLowerCase()] });
    setNewTab('');
  };

  const removeTab = (t: string) => {
    setFormData({ ...formData, tabs: formData.tabs.filter(tab => tab !== t) });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Name and Slug are required.' });
      return;
    }
    
    setSaving(true);
    try {
      const gId = formData.id || formData.slug;
      let logoUrl = formData.logo;
      let bannerUrl = formData.banner;

      if (files.logo) {
        logoUrl = await handleFileUpload(files.logo, `games/${gId}/logo_${Date.now()}`);
      }
      if (files.banner) {
        bannerUrl = await handleFileUpload(files.banner, `games/${gId}/banner_${Date.now()}`);
      }

      const gameRef = doc(db, 'games', gId);
      const gameData = { 
        ...formData, 
        id: gId, 
        logo: logoUrl, 
        banner: bannerUrl,
        updatedAt: new Date().toISOString(),
        createdAt: formData.id ? (games.find(g => g.id === formData.id)?.createdAt || new Date().toISOString()) : new Date().toISOString()
      };
      
      await setDoc(gameRef, gameData, { merge: true });

      toast({ title: 'Record Secured', description: `${formData.name} has been updated in the catalog.` });
      setIsModalOpen(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Operation Failed', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently remove this title from the hub? This action cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'games', id));
      toast({ title: 'Record Purged' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase text-white">Catalog Management</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Unified Games, OTT & Social Control</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 gap-2">
          <Plus size={16} /> Register New Entity
        </Button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search Registry by Name, ID or Category..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border pl-12 h-14 rounded-2xl text-xs font-bold focus:border-primary shadow-xl"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
      ) : filteredGames.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[2rem] p-20 text-center space-y-4">
           <Gamepad2 className="h-10 w-10 text-muted-foreground mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">Registry Empty</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <Card key={game.id} className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl relative group hover:border-primary/20 transition-all">
              <div className="aspect-video relative bg-neutral-900 border-b border-border">
                {game.banner ? (
                  <Image src={game.banner} alt={game.name} fill className="object-cover opacity-60" />
                ) : (
                  <div className="flex items-center justify-center h-full"><ImageIcon size={40} className="text-white/10" /></div>
                )}
                <div className="absolute top-4 left-4 h-12 w-12 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 overflow-hidden">
                  {game.logo && <Image src={game.logo} alt={game.name} fill className="object-cover" />}
                </div>
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                  <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase border shadow-lg ${game.status === 'active' ? 'bg-green-500 border-green-400 text-white' : 'bg-primary border-primary/50 text-white'}`}>
                    {game.status}
                  </div>
                  <div className="bg-black/80 px-2 py-0.5 rounded-md border border-white/10 text-[7px] font-black uppercase text-white/60">
                    {game.category}
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-tight text-white">{game.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest leading-none">Slug: {game.slug}</p>
                    <div className="flex items-center gap-1">
                       <Layers size={10} className="text-primary" />
                       <span className="text-[8px] font-black text-primary uppercase">{game.tabs?.length || 0} Tabs</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleOpenModal(game)} className="flex-1 border-border h-10 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-white/5">
                    <Edit2 size={12} /> Configure Hub
                  </Button>
                  <Button variant="outline" onClick={() => handleDelete(game.id)} className="border-primary/20 text-primary hover:bg-primary/5 h-10 w-10 rounded-xl flex items-center justify-center">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border rounded-3xl p-8 max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter text-white">
              {editingGame ? 'Update Hub Configuration' : 'Register New Hub Entity'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
             <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Display Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Mobile Legends" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Internal Slug (ID)</Label>
                <Input value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="mlbb-global" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" disabled={!!editingGame} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Category Hub</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                  <SelectTrigger className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-[10px] font-black uppercase">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Catalog Priority</Label>
                <Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({...formData, sortOrder: Number(e.target.value)})} className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
              </div>
            </div>

            <div className="space-y-3">
               <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <Layers size={12} className="text-primary" /> Product Tab Configuration
               </Label>
               <div className="flex gap-2">
                  <Input 
                    value={newTab} 
                    onChange={(e) => setNewTab(e.target.value)} 
                    placeholder="e.g. Small Packs" 
                    className="bg-black/50 border-border h-10 rounded-xl text-[10px]"
                    onKeyDown={(e) => e.key === 'Enter' && addTab()}
                  />
                  <Button onClick={addTab} className="h-10 bg-white/5 border border-white/10 text-[9px] font-black uppercase px-4 rounded-xl">Add</Button>
               </div>
               <div className="flex flex-wrap gap-2 pt-1">
                  {formData.tabs.map((tab, idx) => (
                    <div key={idx} className="bg-primary/10 border border-primary/30 text-primary text-[8px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-2">
                      {tab}
                      <button onClick={() => removeTab(tab)} className="hover:text-white"><X size={10} /></button>
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex items-center justify-between bg-black/50 border border-border h-12 rounded-xl px-4">
              <span className="text-[10px] font-bold uppercase text-white/60">Operational Status</span>
              <Switch checked={formData.status === 'active'} onCheckedChange={(v) => setFormData({...formData, status: v ? 'active' : 'inactive'})} />
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                 <div className="flex items-center gap-2">
                   <ImageIcon size={14} className="text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Logo Identity (Grid Icon)</span>
                 </div>
                 <Input type="file" onChange={(e) => setFiles({...files, logo: e.target.files?.[0] || null})} className="bg-background/40 border-dashed" accept="image/*" />
                 {formData.logo && !files.logo && <p className="text-[8px] text-green-500 font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10} /> Asset Persistent</p>}
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                 <div className="flex items-center gap-2">
                   <ImageIcon size={14} className="text-accent" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Banner Identity (Product Page)</span>
                 </div>
                 <Input type="file" onChange={(e) => setFiles({...files, banner: e.target.files?.[0] || null})} className="bg-background/40 border-dashed" accept="image/*" />
                 {formData.banner && !files.banner && <p className="text-[8px] text-green-500 font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10} /> Asset Persistent</p>}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
              {saving ? <Loader2 className="animate-spin" /> : "Commit Registry Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
