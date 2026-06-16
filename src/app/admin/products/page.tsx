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
import { Plus, Edit2, Trash2, Loader2, Package, Search, Tag, IndianRupee } from 'lucide-react';
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

  const productsQuery = useMemo(() => query(collection(db, 'products')), [db]);
  const gamesQuery = useMemo(() => query(collection(db, 'games'), orderBy('sortOrder', 'asc')), [db]);
  const tabsQuery = useMemo(() => query(collection(db, 'tabs'), orderBy('sortOrder', 'asc')), [db]);

  const { data: products, loading: productsLoading } = useCollection(productsQuery);
  const { data: games } = useCollection(gamesQuery);
  const { data: tabs } = useCollection(tabsQuery);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchQuery.toLowerCase())
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
    if (!formData.id || !formData.name || !formData.price || !formData.category) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Missing mandatory fields.' });
      return;
    }
    setSaving(true);
    try {
      const pId = formData.id.toLowerCase().replace(/\s+/g, '-');
      const dataToSave = {
        ...formData,
        id: pId,
        price: Number(formData.price),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'products', pId), dataToSave, { merge: true });
      toast({ title: "Catalog Updated", description: `${formData.name} synchronized.` });
      setIsModalOpen(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently remove this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "Product Terminated" });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Delete Failed', description: e.message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Catalog Hub</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Digital Package Management</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 gap-2">
          <Plus size={16} /> Deploy New Package
        </Button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search items..." 
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
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                    <Tag size={18} className="text-primary opacity-40" />
                  </div>
                  <div className="bg-black/60 rounded-lg px-3 py-1 text-primary font-black text-sm border border-white/5 shadow-xl">
                    ₹{p.price}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight truncate text-white">{p.name}</h3>
                  <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{p.category} • {p.region}</p>
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
              {editingProduct ? 'Configure Package' : 'Deploy New Package'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Package Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="86 Diamonds" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Price (INR)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary" />
                  <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="99" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Parent Category</Label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-black/50 border border-border h-12 rounded-xl text-xs font-bold px-3 text-white focus:border-primary outline-none"
                >
                  <option value="">Select...</option>
                  {games?.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="space-y-0.5">
                <Label className="text-[10px] font-black uppercase">Enable Package</Label>
                <p className="text-[8px] text-muted-foreground uppercase font-black">Visibility in marketplace</p>
              </div>
              <Switch checked={formData.status === 'active'} onCheckedChange={(v) => setFormData({...formData, status: v ? 'active' : 'inactive'})} />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
              {saving ? <Loader2 className="animate-spin" /> : "Execute Deployment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
