
'use client';

import { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, setDoc, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore';
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
import { Plus, Edit2, Trash2, Loader2, Package, Search, Tag, IndianRupee, Layers, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminProductsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    category: '',
    region: 'Global',
    tab: 'small',
    status: 'active'
  });

  const productsQuery = useMemo(() => query(
    collection(db, 'products'),
    limit(100)
  ), [db]);

  const gamesQuery = useMemo(() => query(collection(db, 'games')), [db]);
  const ottQuery = useMemo(() => query(collection(db, 'ott_services')), [db]);
  const socialQuery = useMemo(() => query(collection(db, 'social_services')), [db]);

  const { data: products, loading: productsLoading } = useCollection(productsQuery);
  const { data: games } = useCollection(gamesQuery);
  const { data: ott } = useCollection(ottQuery);
  const { data: social } = useCollection(socialQuery);

  const categories = useMemo(() => {
    return [
      ...(games || []).map(g => ({ id: g.id, name: g.name, type: 'Game' })),
      ...(ott || []).map(o => ({ id: o.id, name: o.name, type: 'OTT' })),
      ...(social || []).map(s => ({ id: s.id, name: s.name, type: 'Social' }))
    ];
  }, [games, ott, social]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        id: product.id || '',
        name: product.name || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        region: product.region || 'Global',
        tab: product.tab || 'small',
        status: product.status || 'active'
      });
    } else {
      setEditingProduct(null);
      setFormData({ 
        id: '', name: '', price: '', category: '', region: 'Global', tab: 'small',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Mandatory fields missing (Name, Price, Category).' });
      return;
    }
    setSaving(true);
    try {
      const pId = formData.id || `${formData.category}-${Date.now()}`;
      const dataToSave = {
        ...formData,
        id: pId,
        price: Number(formData.price),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'products', pId), dataToSave, { merge: true });
      toast({ title: "Package Registry Updated", description: `${formData.name} is now live.` });
      setIsModalOpen(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently remove this package from the registry?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "Package Purged" });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Delete Failed', description: e.message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Package Registry</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Digital SKU Management</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 gap-2">
          <Plus size={16} /> Deploy New SKU
        </Button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search SKUs or Categories..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border pl-12 h-14 rounded-2xl text-xs font-bold focus:border-primary shadow-xl"
        />
      </div>

      {productsLoading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[2rem] p-20 text-center space-y-4">
           <Package className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">Registry Empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <Card key={p.id} className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl group hover:border-primary/20 transition-all">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <div className="flex items-center gap-1 text-primary">
                        <Tag size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{p.category}</span>
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-tight text-white">{p.name}</h3>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-black text-primary leading-none">₹{p.price}</p>
                      <p className="text-[7px] font-black uppercase opacity-40 mt-1">{p.tab}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => handleOpenModal(p)} className="flex-1 border-border h-10 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-white/5">
                    <Edit2 size={12} /> Edit
                  </Button>
                  <Button variant="outline" onClick={() => handleDelete(p.id)} className="border-primary/20 text-primary hover:bg-primary/5 h-10 w-10 rounded-xl flex items-center justify-center">
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
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">
              {editingProduct ? 'Configure SKU' : 'Registry Entry'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Package Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. 86 Diamonds" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Parent Category</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                  <SelectTrigger className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold">
                    <SelectValue placeholder="Select Title" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-[10px] font-black uppercase">
                        {c.name} ({c.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Price (INR)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary" />
                  <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="99" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Catalog Tab</Label>
                <Select value={formData.tab} onValueChange={(val) => setFormData({...formData, tab: val})}>
                  <SelectTrigger className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold">
                    <SelectValue placeholder="Select Tab" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="small" className="text-[10px] font-black uppercase">Small Packs</SelectItem>
                    <SelectItem value="large" className="text-[10px] font-black uppercase">Large Packs</SelectItem>
                    <SelectItem value="pass" className="text-[10px] font-black uppercase">Passes</SelectItem>
                    <SelectItem value="promo" className="text-[10px] font-black uppercase">Promo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Region</Label>
                <Select value={formData.region} onValueChange={(val) => setFormData({...formData, region: val})}>
                  <SelectTrigger className="bg-black/50 border-border h-12 rounded-xl focus:border-primary font-bold">
                    <SelectValue placeholder="Global" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="Global" className="text-[10px] font-black uppercase">Global</SelectItem>
                    <SelectItem value="India" className="text-[10px] font-black uppercase">India</SelectItem>
                    <SelectItem value="Indonesia" className="text-[10px] font-black uppercase">Indonesia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="space-y-0.5">
                <Label className="text-[10px] font-black uppercase">SKU Operational Status</Label>
                <p className="text-[8px] text-muted-foreground uppercase font-black">Visibility in catalog</p>
              </div>
              <Switch checked={formData.status === 'active'} onCheckedChange={(v) => setFormData({...formData, status: v ? 'active' : 'inactive'})} />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
              {saving ? <Loader2 className="animate-spin" /> : "Commit SKU Registry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
