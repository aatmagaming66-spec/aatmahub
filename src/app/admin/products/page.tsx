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
import { Plus, Edit2, Trash2, Loader2, Package, Search, Tag, IndianRupee, Globe, Upload, ImageIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function AdminProductsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    category: 'Game',
    region: 'Global',
    imageUrl: '',
    icon: '',
    cardImage: '',
    banner: '',
    thumbnail: ''
  });

  const productsQuery = useMemo(() => query(
    collection(db, 'products'),
    orderBy('name', 'asc')
  ), [db]);

  const { data: products, loading } = useCollection(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

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

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        id: product.id || '',
        name: product.name || '',
        price: product.price?.toString() || '',
        category: product.category || 'Game',
        region: product.region || 'Global',
        imageUrl: product.imageUrl || '',
        icon: product.icon || '',
        cardImage: product.cardImage || '',
        banner: product.banner || '',
        thumbnail: product.thumbnail || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ 
        id: '', name: '', price: '', category: 'Game', region: 'Global', 
        imageUrl: '', icon: '', cardImage: '', banner: '', thumbnail: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.id || !formData.name || !formData.price) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Mandatory fields missing.' });
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
      toast({ title: "Catalog Updated", description: `Product ${formData.name} is now live.` });
      setIsModalOpen(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will remove the product permanently.')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "Product Terminated", description: "Record purged from catalog." });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Delete Failed', description: e.message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Product Catalog</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Marketplace Control Hub</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 gap-2">
          <Plus className="h-4 w-4" /> Deploy New Product
        </Button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search by Product Name or ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border pl-12 h-14 rounded-2xl text-xs font-bold focus:border-primary shadow-xl"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[2.5rem] p-20 text-center space-y-4">
           <Package className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">No Products in Registry</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <Card key={p.id} className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl group hover:border-primary/20 transition-all">
              <CardContent className="p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner overflow-hidden relative">
                      {(p.icon || p.imageUrl) ? <Image src={p.icon || p.imageUrl} alt={p.name} fill className="object-cover" /> : <Tag className="h-6 w-6 text-primary" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-tight">{p.name}</h3>
                      <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{p.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-white">₹{p.price}</p>
                    <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Retail Price</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-5 border-t border-border">
                   <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-[8px] font-black text-muted-foreground uppercase block mb-1">Region</span>
                      <div className="flex items-center gap-1.5">
                        <Globe size={10} className="text-accent" />
                        <span className="text-[10px] font-black uppercase">{p.region}</span>
                      </div>
                   </div>
                   <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-[8px] font-black text-muted-foreground uppercase block mb-1">Category</span>
                      <span className="text-[10px] font-black uppercase">{p.category}</span>
                   </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => handleOpenModal(p)} className="flex-1 border-border h-10 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-white/5">
                    <Edit2 size={12} /> Edit
                  </Button>
                  <Button variant="outline" onClick={() => handleDelete(p.id)} className="flex-1 border-primary/20 text-primary hover:bg-primary/5 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2">
                    <Trash2 size={12} /> Purge
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border rounded-3xl p-0 max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">
              {editingProduct ? 'Update Product Protocol' : 'Deploy New Entity'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-8 no-scrollbar">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Internal ID</Label>
                <Input 
                  disabled={!!editingProduct}
                  value={formData.id}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  placeholder="mlbb-86-diamonds" 
                  className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Product Name</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="86 Diamonds" 
                  className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Price (INR)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary" />
                  <Input 
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="99" 
                    className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Distribution Region</Label>
                <Input 
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  placeholder="India, Global..." 
                  className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold"
                />
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
                  label="Product Icon" 
                  description="Tiny list identity"
                  value={formData.icon || formData.imageUrl} 
                  onChange={(e) => handleFileChange(e, 'icon')}
                  onRemove={() => setFormData({...formData, icon: '', imageUrl: ''})}
                />
                <MediaUploadField 
                  label="Card Image" 
                  description="Marketplace display"
                  value={formData.cardImage} 
                  onChange={(e) => handleFileChange(e, 'cardImage')}
                  onRemove={() => setFormData({...formData, cardImage: ''})}
                />
                <MediaUploadField 
                  label="Product Banner" 
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
          </div>

          <DialogFooter className="p-8 pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
              {saving ? <Loader2 className="animate-spin" /> : (editingProduct ? "Commit Product Changes" : "Deploy to Catalog")}
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