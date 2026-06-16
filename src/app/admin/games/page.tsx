'use client';

import { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, setDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Loader2, Search, Gamepad2, Save, Globe, ImageIcon, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function GameManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    slug: '',
    status: 'active',
    icon: '',
    cardImage: '',
    banner: '',
    thumbnail: '',
    requirePlayerId: true,
    requireServerId: true,
    requireVerifyId: false,
    sortOrder: 0
  });

  // MEMOIZE QUERY TO PREVENT INFINITE LOOPS
  const gamesQuery = useMemo(() => query(
    collection(db, 'games'), 
    orderBy('sortOrder', 'asc')
  ), [db]);

  const { data: games, loading } = useCollection(gamesQuery);

  const filteredGames = useMemo(() => {
    if (!games) return [];
    return games.filter(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [games, searchQuery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File Too Large', description: 'Maximum size is 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [key]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenModal = (game: any = null) => {
    if (game) {
      setEditingGame(game);
      setFormData({
        id: game.id || '',
        name: game.name || '',
        slug: game.slug || '',
        status: game.status || 'active',
        icon: game.icon || '',
        cardImage: game.cardImage || '',
        banner: game.banner || '',
        thumbnail: game.thumbnail || '',
        requirePlayerId: game.requirePlayerId !== undefined ? game.requirePlayerId : true,
        requireServerId: game.requireServerId !== undefined ? game.requireServerId : true,
        requireVerifyId: game.requireVerifyId !== undefined ? game.requireVerifyId : false,
        sortOrder: game.sortOrder || 0
      });
    } else {
      setEditingGame(null);
      setFormData({
        id: '', name: '', slug: '', status: 'active', icon: '', cardImage: '', banner: '', thumbnail: '',
        requirePlayerId: true, requireServerId: true, requireVerifyId: false, sortOrder: games.length + 1
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) return;
    setSaving(true);
    try {
      const gId = formData.id || formData.slug;
      await setDoc(doc(db, 'games', gId), { ...formData, id: gId, updatedAt: new Date().toISOString() }, { merge: true });
      toast({ title: 'Registry Synchronized', description: `${formData.name} is now updated.` });
      setIsModalOpen(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently remove this game from the hub?')) return;
    try {
      await deleteDoc(doc(db, 'games', id));
      toast({ title: 'Game Purged', description: 'Record removed successfully.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Game Registry</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">HUB Distribution Grid</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 gap-2">
          <Plus size={16} /> Deploy New Title
        </Button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search registered games..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border pl-12 h-14 rounded-2xl text-xs font-bold focus:border-primary shadow-xl"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
      ) : filteredGames.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[2rem] p-20 text-center">
          <Gamepad2 className="mx-auto h-10 w-10 text-muted-foreground opacity-20 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No Games in Registry</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <Card key={game.id} className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl relative group hover:border-primary/20 transition-all">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner overflow-hidden relative">
                    {game.icon ? <Image src={game.icon} alt={game.name} fill className="object-cover" /> : <Gamepad2 size={24} className="text-primary" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black uppercase tracking-tight">{game.name}</h3>
                    <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{game.slug}</p>
                    <div className={`mt-2 px-2 py-0.5 rounded-full text-[7px] font-black uppercase inline-block border ${game.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-primary/10 text-primary border-primary/10'}`}>
                      {game.status}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
                  <div className="bg-white/5 p-2 rounded-xl flex items-center justify-between">
                    <span className="text-[7px] font-black uppercase text-muted-foreground">Player ID</span>
                    <div className={`h-1.5 w-1.5 rounded-full ${game.requirePlayerId ? 'bg-green-500' : 'bg-white/10'}`} />
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl flex items-center justify-between">
                    <span className="text-[7px] font-black uppercase text-muted-foreground">Server ID</span>
                    <div className={`h-1.5 w-1.5 rounded-full ${game.requireServerId ? 'bg-green-500' : 'bg-white/10'}`} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleOpenModal(game)} className="flex-1 border-border h-10 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-white/5">
                    <Edit2 size={12} /> Edit
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
        <DialogContent className="bg-card border-border rounded-3xl p-0 max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">
              {editingGame ? 'Update Game Registry' : 'Deploy New Game'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-8 no-scrollbar">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Game Title</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Mobile Legends" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Slug / ID</Label>
                <Input value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="mlbb-global" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
              </div>
            </div>

            {/* Media Protocols Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Media Protocols</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <MediaUploadField 
                  label="Game Icon" 
                  description="Tiny list identity"
                  value={formData.icon} 
                  onChange={(e) => handleFileChange(e, 'icon')}
                  onRemove={() => setFormData({...formData, icon: ''})}
                />
                <MediaUploadField 
                  label="Card Image" 
                  description="Marketplace display"
                  value={formData.cardImage} 
                  onChange={(e) => handleFileChange(e, 'cardImage')}
                  onRemove={() => setFormData({...formData, cardImage: ''})}
                />
                <MediaUploadField 
                  label="Game Banner" 
                  description="Cinematic detail header"
                  value={formData.banner} 
                  onChange={(e) => handleFileChange(e, 'banner')}
                  onRemove={() => setFormData({...formData, banner: ''})}
                />
                <MediaUploadField 
                  label="Thumbnail" 
                  description="Search preview"
                  value={formData.thumbnail} 
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                  onRemove={() => setFormData({...formData, thumbnail: ''})}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-10px] font-black uppercase">Enable Game</Label>
                  <p className="text-[8px] text-muted-foreground uppercase font-black">Visibility on frontend</p>
                </div>
                <Switch checked={formData.status === 'active'} onCheckedChange={(v) => setFormData({...formData, status: v ? 'active' : 'inactive'})} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label className="text-[10px] font-black uppercase">Require Player ID</Label></div>
                <Switch checked={formData.requirePlayerId} onCheckedChange={(v) => setFormData({...formData, requirePlayerId: v})} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label className="text-[10px] font-black uppercase">Require Server ID</Label></div>
                <Switch checked={formData.requireServerId} onCheckedChange={(v) => setFormData({...formData, requireServerId: v})} />
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
              {saving ? <Loader2 className="animate-spin" /> : (editingGame ? "Commit Registry Changes" : "Deploy to Registry")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MediaUploadField({ label, description, value, onChange, onRemove }: any) {
  return (
    <div className="bg-black/20 border border-white/5 p-4 rounded-2xl space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[9px] font-black uppercase text-white/90">{label}</p>
          <p className="text-[7px] font-bold text-muted-foreground uppercase">{description}</p>
        </div>
        {value && (
          <button onClick={onRemove} className="text-primary hover:text-white transition-colors">
            <X size={12} />
          </button>
        )}
      </div>

      <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-dashed border-white/10 flex items-center justify-center group">
        {value ? (
          <Image src={value} alt={label} fill className="object-contain" />
        ) : (
          <Upload size={16} className="text-muted-foreground opacity-20" />
        )}
        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
          <Upload size={20} className="text-white" />
          <input type="file" className="hidden" accept="image/*" onChange={onChange} />
        </label>
      </div>
    </div>
  );
}