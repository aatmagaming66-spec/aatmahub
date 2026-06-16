
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
import { Plus, Edit2, Trash2, Loader2, Search, Layers, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TabManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTab, setEditingTab] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    status: 'active',
    sortOrder: 0
  });

  const { data: tabs, loading } = useCollection(query(collection(db, 'tabs'), orderBy('sortOrder', 'asc')));

  const filteredTabs = useMemo(() => {
    if (!tabs) return [];
    return tabs.filter(t => t.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tabs, searchQuery]);

  const handleOpenModal = (tab: any = null) => {
    if (tab) {
      setEditingTab(tab);
      setFormData(tab);
    } else {
      setEditingTab(null);
      setFormData({
        id: '', name: '', status: 'active', sortOrder: tabs.length + 1
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
      const id = formData.id || formData.name.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, 'tabs', id), { ...formData, id, updatedAt: new Date().toISOString() }, { merge: true });
      toast({ title: 'Tab Synchronized', description: `${formData.name} is now available in the catalog.` });
      setIsModalOpen(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently remove this product tab?')) return;
    try {
      await deleteDoc(doc(db, 'tabs', id));
      toast({ title: 'Tab Purged', description: 'Record removed successfully.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Tab Manager</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Catalog Categorization Logic</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 gap-2">
          <Plus size={16} /> Deploy New Tab
        </Button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search categorization tabs..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border pl-12 h-14 rounded-2xl text-xs font-bold focus:border-primary shadow-xl"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTabs.map((tab) => (
            <Card key={tab.id} className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl group hover:border-primary/20 transition-all">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-black/40 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                    <Layers size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black uppercase tracking-tight">{tab.name}</h3>
                    <div className={`mt-2 px-2 py-0.5 rounded-full text-[7px] font-black uppercase inline-block border ${tab.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-primary/10 text-primary border-primary/10'}`}>
                      {tab.status}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleOpenModal(tab)} className="flex-1 border-border h-10 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-white/5">
                    <Edit2 size={12} /> Edit
                  </Button>
                  <Button variant="outline" onClick={() => handleDelete(tab.id)} className="border-primary/20 text-primary hover:bg-primary/5 h-10 w-10 rounded-xl flex items-center justify-center">
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
          <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-tighter">{editingTab ? 'Update Categorization' : 'Deploy New Tab'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-6">
            <div className="space-y-2 col-span-2">
              <Label className="text-[9px] font-black uppercase tracking-widest">Tab Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Small Packs, Weekly Pass..." className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
            </div>
            
            <div className="col-span-2 space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[10px] font-black uppercase">Enable Tab</Label>
                  <p className="text-[8px] text-muted-foreground uppercase font-black">Visibility on product pages</p>
                </div>
                <Switch checked={formData.status === 'active'} onCheckedChange={(v) => setFormData({...formData, status: v ? 'active' : 'inactive'})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
              {saving ? <Loader2 className="animate-spin" /> : "Commit Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
