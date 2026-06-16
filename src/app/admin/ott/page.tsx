'use client';

import { useState, useMemo, memo } from 'react';
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
import { Plus, Edit2, Trash2, Loader2, Search, Tv } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const ServiceCard = memo(function ServiceCard({ item, onEdit, onDelete }: any) {
  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl group hover:border-primary/20 transition-all">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner overflow-hidden relative">
            {item.icon ? <Image src={item.icon} alt={item.name} fill className="object-cover" /> : <Tv size={24} className="text-primary" />}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black uppercase tracking-tight">{item.name}</h3>
            <div className={`mt-2 px-2 py-0.5 rounded-full text-[7px] font-black uppercase inline-block border ${item.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-primary/10 text-primary border-primary/10'}`}>
              {item.status}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onEdit(item)} className="flex-1 border-border h-10 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-white/5">
            <Edit2 size={12} /> Edit
          </Button>
          <Button variant="outline" onClick={() => onDelete(item.id)} className="border-primary/20 text-primary hover:bg-primary/5 h-10 w-10 rounded-xl flex items-center justify-center">
            <Trash2 size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export default function OttManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    status: 'active',
    icon: '',
    sortOrder: 0
  });

  const ottQuery = useMemo(() => query(
    collection(db, 'ott_services'), 
    orderBy('sortOrder', 'asc')
  ), [db]);

  const { data: items, loading } = useCollection(ottQuery);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter(i => i.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [items, searchQuery]);

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        id: '', name: '', status: 'active', icon: '', sortOrder: (items?.length || 0) + 1
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
      const id = formData.id || formData.name.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, 'ott_services', id), { ...formData, id, updatedAt: new Date().toISOString() }, { merge: true });
      toast({ title: 'Service Updated', description: `${formData.name} configuration saved.` });
      setIsModalOpen(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently remove this OTT service?')) return;
    try {
      await deleteDoc(doc(db, 'ott_services', id));
      toast({ title: 'Service Purged', description: 'Record removed successfully.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">OTT Hub</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Streaming Service Distribution</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 gap-2">
          <Plus size={16} /> Deploy New Service
        </Button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search OTT services..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border pl-12 h-14 rounded-2xl text-xs font-bold focus:border-primary shadow-xl"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[2rem] p-20 text-center">
          <Tv className="mx-auto h-10 w-10 text-muted-foreground opacity-20 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No OTT Services Found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <ServiceCard key={item.id} item={item} onEdit={handleOpenModal} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border rounded-3xl p-8 max-w-xl">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-tighter">{editingItem ? 'Update Service' : 'Deploy New Service'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-6">
            <div className="space-y-2 col-span-2">
              <Label className="text-[9px] font-black uppercase tracking-widest">Service Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Netflix Premium" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
            </div>
            
            <div className="col-span-2 space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[10px] font-black uppercase">Enable Service</Label>
                  <p className="text-[8px] text-muted-foreground uppercase font-black">Visibility on frontend</p>
                </div>
                <Switch checked={formData.status === 'active'} onCheckedChange={(v) => setFormData({...formData, status: v ? 'active' : 'inactive'})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
              {saving ? <Loader2 className="animate-spin" /> : "Commit Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
