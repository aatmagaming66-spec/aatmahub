'use client';

import { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, setDoc, deleteDoc, doc, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Loader2, Search, Gamepad2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const handleOpenModal = (game: any = null) => {
    if (game) {
      setEditingGame(game);
      setFormData({
        id: game.id || '',
        name: game.name || '',
        slug: game.slug || '',
        status: game.status || 'active',
        requirePlayerId: game.requirePlayerId !== undefined ? game.requirePlayerId : true,
        requireServerId: game.requireServerId !== undefined ? game.requireServerId : true,
        requireVerifyId: game.requireVerifyId !== undefined ? game.requireVerifyId : false,
        sortOrder: game.sortOrder || 0
      });
    } else {
      setEditingGame(null);
      setFormData({
        id: '', name: '', slug: '', status: 'active',
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
      const gameRef = doc(db, 'games', gId);
      const gameData = { ...formData, id: gId, updatedAt: new Date().toISOString() };
      
      await setDoc(gameRef, gameData, { merge: true });

      // REGISTER METADATA STUB (No automatic image sync to prevent blob errors)
      const mediaRef = doc(db, 'media_assets', gId);
      const mediaSnap = await getDoc(mediaRef);
      
      if (!mediaSnap.exists()) {
        await setDoc(mediaRef, {
          entityId: gId,
          entityType: 'game',
          entityName: formData.name,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      toast({ title: 'Identity Registry Synchronized', description: `${formData.name} catalog record updated.` });
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
      // Metadata remains in Media Hub as a historical record unless manually purged there
      toast({ title: 'Game Purged' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase text-white">Game Registry</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">High-Performance Hub</p>
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
                  <div className="h-16 w-16 bg-gradient-to-br from-primary/20 to-black rounded-2xl flex items-center justify-center border border-white/5">
                    <Gamepad2 size={24} className="text-primary opacity-40" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black uppercase tracking-tight text-white">{game.name}</h3>
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
        <DialogContent className="bg-card border-border rounded-3xl p-8 max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter text-white">
              {editingGame ? 'Update Title' : 'Deploy Title'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
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
          </div>

          <DialogFooter>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
              {saving ? <Loader2 className="animate-spin" /> : "Commit to Registry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Added missing imports helper
import { getDoc } from 'firebase/firestore';
