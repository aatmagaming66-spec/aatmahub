'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useStorage } from '@/firebase/provider';
import { collection, setDoc, deleteDoc, doc, query } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Loader2, Search, Gamepad2, ImageIcon, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function GameManagementPage() {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const gamesQuery = useMemo(() => query(collection(db, 'games')), [db]);
  const { data: games, loading } = useCollection(gamesQuery);

  const filteredGames = useMemo(() => {
    if (!games) return [];
    return games.filter(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [games, searchQuery]);

  // PERFORMANCE: Replaced Base64 storage with Firebase Storage binary uploads
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File Too Large', description: 'Maximum size is 5MB.' });
      return;
    }

    setUploading(key);
    setUploadProgress(0);

    const storageRef = ref(storage, `games/${formData.slug || 'temp'}_${key}_${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snap) => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100),
      (err) => {
        setUploading(null);
        toast({ variant: 'destructive', title: 'Upload Failed', description: err.message });
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData(prev => ({ ...prev, [key]: url }));
        setUploading(null);
        toast({ title: 'Asset Prepared', description: `${key} uploaded to storage.` });
      }
    );
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
        requirePlayerId: true, requireServerId: true, requireVerifyId: false, sortOrder: (games?.length || 0) + 1
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
    if (!confirm('Permanently remove this game?')) return;
    try {
      await deleteDoc(doc(db, 'games', id));
      toast({ title: 'Game Purged' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Game Registry</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Payload-optimized Storage Hub</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 gap-2">
          <Plus size={16} /> Deploy New Title
        </Button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search games..." 
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
              {editingGame ? 'Update Title' : 'Deploy Title'}
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

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Digital Assets</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <MediaUploadField 
                  label="Icon" 
                  value={formData.icon} 
                  isUploading={uploading === 'icon'}
                  progress={uploadProgress}
                  onChange={(e) => handleFileChange(e, 'icon')}
                  onRemove={() => setFormData({...formData, icon: ''})}
                />
                <MediaUploadField 
                  label="Card Image" 
                  value={formData.cardImage} 
                  isUploading={uploading === 'cardImage'}
                  progress={uploadProgress}
                  onChange={(e) => handleFileChange(e, 'cardImage')}
                  onRemove={() => setFormData({...formData, cardImage: ''})}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={saving || !!uploading} className="w-full bg-primary h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
              {saving ? <Loader2 className="animate-spin" /> : "Execute Protocol"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MediaUploadField({ label, value, isUploading, progress, onChange, onRemove }: any) {
  return (
    <div className="bg-black/20 border border-white/5 p-4 rounded-2xl space-y-3">
      <div className="flex justify-between items-start">
        <p className="text-[9px] font-black uppercase text-white/90">{label}</p>
        {value && !isUploading && <button onClick={onRemove} className="text-primary hover:text-white"><X size={12} /></button>}
      </div>

      <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-dashed border-white/10 flex items-center justify-center group">
        {value ? (
          <Image src={value} alt={label} fill className="object-cover" />
        ) : (
          <Upload size={16} className="text-muted-foreground opacity-20" />
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center p-4 space-y-2">
            <Progress value={progress} className="h-1 bg-primary/20" />
            <span className="text-[8px] font-black text-primary uppercase">{Math.round(progress)}% Secure Upload</span>
          </div>
        )}

        {!isUploading && (
          <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload size={20} className="text-white" />
            <input type="file" className="hidden" accept="image/*" onChange={onChange} />
          </label>
        )}
      </div>
    </div>
  );
}
