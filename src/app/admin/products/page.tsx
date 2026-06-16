'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useStorage } from '@/firebase/provider';
import { collection, setDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
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
import { Plus, Edit2, Trash2, Loader2, Package, Search, Tag, IndianRupee, Globe, Upload, ImageIcon, X, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function AdminProductsPage() {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    category: '',
    region: 'Global',
    tab: 'small',
    status: 'active',
    thumbnail: '',
    banner: ''
  });

  // Queries
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
      p.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleFileUpload = async (file: File, key: 'thumbnail' | 'banner') => {
    if (!file) return;
    setUploading(key);
    setUploadProgress(0);

    const storageRef = ref(storage, `products/${formData.id || 'new'}_${key}_${Date.now()}`);
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
        toast({ title: 'Asset Uploaded', description: `${key} ready for deployment.` });
      }
    );
  };

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
        status: product.status || 'active',
        thumbnail: product.thumbnail || '',
        banner: product.banner || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ 
        id: '', name: '', price: '', category: '', region: 'Global', tab: 'small',
        status: 'active', thumbnail: '', banner: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.id || !formData.name || !formData.price || !formData.category) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Missing mandatory fields (ID, Name, Price, Category).' });
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
      toast({ title: "Catalog Updated", description: `Product ${formData.name} is now synchronized.` });
      setIsModalOpen(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently remove this product? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "Product Terminated", description: "Record purged from database." });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Delete Failed', description: e.message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Product Registry</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Digital Package Management</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 gap-2">
          <Plus size={16} /> Deploy New Package
        </Button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search items by Name, Category, or ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border pl-12 h-14 rounded-2xl text-xs font-bold focus:border-primary shadow-xl"
        />
      </div>

      {productsLoading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[2.5rem] p-20 text-center space-y-4">
           <Package className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">Registry Empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <Card key={p.id} className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl group hover:border-primary/20 transition-all">
              <CardContent className="p-0">
                <div className="relative aspect-[21/9] w-full bg-black/40 overflow-hidden">
                  {p.banner ? (
                    <Image src={p.banner} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="flex items-center justify-center h-full opacity-10"><ImageIcon size={40} /></div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-lg px-3 py-1 text-primary font-black text-sm border border-white/5 shadow-xl">
                    ₹{p.price}
                  </div>
                  <div className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter border ${p.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                    {p.status}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 overflow-hidden relative shrink-0">
                      {p.thumbnail ? <Image src={p.thumbnail} alt="" fill className="object-cover" /> : <Tag size={20} className="text-primary/40" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black uppercase tracking-tight truncate text-white">{p.name}</h3>
                      <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{p.category} • {p.region}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleOpenModal(p)} className="border-border h-10 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-white/5">
                      <Edit2 size={12} /> Edit
                    </Button>
                    <Button variant="outline" onClick={() => handleDelete(p.id)} className="border-primary/20 text-primary hover:bg-primary/5 h-10 rounded-xl flex items-center justify-center">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product Management Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border rounded-3xl p-0 max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">
              {editingProduct ? 'Configure Digital Entity' : 'Deploy New Package'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-8 no-scrollbar">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label className="text-[9px] font-black uppercase tracking-widest">Internal ID (Permanent)</Label>
                <Input disabled={!!editingProduct} value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} placeholder="mlbb-86-diamonds" className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
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
                <Label className="text-[9px] font-black uppercase tracking-widest">Parent Category (Game ID)</Label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-black/50 border border-border h-12 rounded-xl text-xs font-bold px-3 text-white focus:border-primary outline-none"
                >
                  <option value="">Select Category...</option>
                  {games?.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Catalog Tab</Label>
                <select 
                  value={formData.tab} 
                  onChange={(e) => setFormData({...formData, tab: e.target.value})}
                  className="w-full bg-black/50 border border-border h-12 rounded-xl text-xs font-bold px-3 text-white focus:border-primary outline-none"
                >
                  {tabs?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  {(!tabs || tabs.length === 0) && (
                    <>
                      <option value="small">Small Packs</option>
                      <option value="large">Large Packs</option>
                      <option value="pass">Passes</option>
                    </>
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Distribution Region</Label>
                <Input value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} placeholder="Global, India..." className="bg-black/50 border-border h-12 rounded-xl text-xs font-bold" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="space-y-0.5">
                <Label className="text-[10px] font-black uppercase">Enable Package</Label>
                <p className="text-[8px] text-muted-foreground uppercase font-black">Visibility in marketplace</p>
              </div>
              <Switch checked={formData.status === 'active'} onCheckedChange={(v) => setFormData({...formData, status: v ? 'active' : 'inactive'})} />
            </div>

            {/* Media Integration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1"><ImageIcon size={14} className="text-primary" /><h3 className="text-[10px] font-black uppercase tracking-widest">Media Protocol</h3></div>
              <div className="grid grid-cols-2 gap-4">
                <MediaUploader 
                  label="Thumbnail" 
                  value={formData.thumbnail} 
                  isUploading={uploading === 'thumbnail'} 
                  progress={uploadProgress}
                  onFile={(file) => handleFileUpload(file, 'thumbnail')} 
                  onRemove={() => setFormData({...formData, thumbnail: ''})}
                />
                <MediaUploader 
                  label="Banner" 
                  value={formData.banner} 
                  isUploading={uploading === 'banner'} 
                  progress={uploadProgress}
                  onFile={(file) => handleFileUpload(file, 'banner')} 
                  onRemove={() => setFormData({...formData, banner: ''})}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={saving || !!uploading} className="w-full bg-primary h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
              {saving ? <Loader2 className="animate-spin" /> : (editingProduct ? "Authorize Changes" : "Execute Deployment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MediaUploader({ label, value, onFile, onRemove, isUploading, progress }: any) {
  return (
    <div className="bg-black/20 border border-white/5 p-4 rounded-2xl space-y-3 flex flex-col">
      <div className="flex justify-between items-start">
        <p className="text-[9px] font-black uppercase text-white/90">{label}</p>
        {value && !isUploading && <button onClick={onRemove} className="text-primary hover:text-white"><X size={12} /></button>}
      </div>

      <div className="relative flex-1 min-h-[80px] rounded-xl overflow-hidden bg-black/40 border border-dashed border-white/10 flex items-center justify-center group">
        {value ? (
          <Image src={value} alt={label} fill className="object-cover" />
        ) : (
          <Upload size={16} className="text-muted-foreground opacity-20" />
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center p-4">
            <Progress value={progress} className="h-1 bg-primary/20 mb-2" />
            <span className="text-[8px] font-black text-primary">{Math.round(progress)}%</span>
          </div>
        )}

        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
          <Upload size={20} className="text-white" />
          <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
      </div>
    </div>
  );
}
