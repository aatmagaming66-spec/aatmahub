'use client';

import { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, setDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
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
import { Plus, Edit2, Trash2, Loader2, Trophy, Save, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_RANKS, type RankDefinition } from '@/lib/ranks';

export default function RankManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<RankDefinition>({
    id: '',
    name: '',
    threshold: 0,
    discount: 0,
    color: '#DC2626',
    benefits: [''],
    sortOrder: 0,
    detailedBenefits: {
      discount: '0%',
      cashback: '0%',
      priority: 'Standard',
      promotions: 'Basic',
      limitBonus: '0%',
      accessLevel: 'Verified'
    }
  });

  const ranksQuery = useMemo(() => query(collection(db, 'ranks'), orderBy('sortOrder', 'asc')), [db]);
  const { data: ranks, loading } = useCollection<RankDefinition>(ranksQuery);

  const handleOpenModal = (rank: any = null) => {
    if (rank) {
      setEditingRank(rank);
      setFormData(rank);
    } else {
      setEditingRank(null);
      setFormData({
        id: '',
        name: '',
        threshold: 0,
        discount: 0,
        color: '#DC2626',
        benefits: [''],
        sortOrder: ranks.length,
        detailedBenefits: {
          discount: '0%',
          cashback: '0%',
          priority: 'Standard',
          promotions: 'Basic',
          limitBonus: '0%',
          accessLevel: 'Verified'
        }
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.id) return;
    setSaving(true);
    try {
      const filteredBenefits = formData.benefits.filter(b => b.trim() !== '');
      await setDoc(doc(db, 'ranks', formData.id), { ...formData, benefits: filteredBenefits }, { merge: true });
      toast({ title: 'Ranks Updated', description: `${formData.name} rank settings saved.` });
      setIsModalOpen(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const seedDefaults = async () => {
    if (!confirm('Add default ranks to the database?')) return;
    setSaving(true);
    try {
      for (const rank of DEFAULT_RANKS) {
        await setDoc(doc(db, 'ranks', rank.id), rank);
      }
      toast({ title: 'Defaults Added' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Membership Ranks</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Manage User Tiers and Discounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={seedDefaults} className="border-border rounded-2xl font-black uppercase text-[9px] tracking-widest h-12 px-6">
            Add Defaults
          </Button>
          <Button onClick={() => handleOpenModal()} className="bg-primary h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 gap-2">
            <Plus size={16} /> New Rank
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
      ) : ranks.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[2rem] p-20 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground opacity-20 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No Ranks Found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ranks.map((rank) => (
            <Card key={rank.id} className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl group hover:border-primary/20 transition-all">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center" style={{ color: rank.color }}>
                        <Trophy size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-tight">{rank.name}</h3>
                        <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">₹{rank.threshold.toLocaleString()} Spend Goal</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-black text-primary">{rank.discount}%</p>
                      <p className="text-[7px] font-black text-muted-foreground uppercase">Discount</p>
                   </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleOpenModal(rank)} className="flex-1 border-border h-10 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-white/5">
                    <Edit2 size={12} /> Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border rounded-3xl p-8 max-w-xl">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-tighter">Rank Settings</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-6 overflow-y-auto max-h-[60vh] no-scrollbar">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase">ID</Label>
              <Input value={formData.id} disabled={!!editingRank} onChange={(e) => setFormData({...formData, id: e.target.value})} placeholder="warrior" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase">Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Warrior" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase">Spend Threshold (₹)</Label>
              <Input type="number" value={formData.threshold} onChange={(e) => setFormData({...formData, threshold: Number(e.target.value)})} className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase">Store Discount (%)</Label>
              <Input type="number" value={formData.discount} onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})} className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase">Rank Color</Label>
              <Input type="color" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="bg-black/50 border-border h-12 rounded-xl p-1" />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase">Sort Order</Label>
              <Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({...formData, sortOrder: Number(e.target.value)})} className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
            </div>
            <div className="col-span-2 space-y-3">
               <Label className="text-[9px] font-black uppercase flex items-center justify-between">
                 Benefits List
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFormData({...formData, benefits: [...formData.benefits, '']})}>
                   <Plus size={10} />
                 </Button>
               </Label>
               {formData.benefits.map((benefit, i) => (
                 <div key={i} className="flex gap-2">
                    <Input value={benefit} onChange={(e) => {
                      const nb = [...formData.benefits];
                      nb[i] = e.target.value;
                      setFormData({...formData, benefits: nb});
                    }} className="bg-black/50 border-border h-10 rounded-xl text-xs" />
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-primary" onClick={() => {
                      const nb = formData.benefits.filter((_, idx) => idx !== i);
                      setFormData({...formData, benefits: nb});
                    }}>
                      <Trash2 size={12} />
                    </Button>
                 </div>
               ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest">
              {saving ? <Loader2 className="animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
