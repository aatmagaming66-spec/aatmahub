'use client';

import { useState, useMemo, useRef } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, setDoc, deleteDoc, doc, query, limit } from 'firebase/firestore';
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
import { Plus, Edit2, Trash2, Loader2, Search, Tag, IndianRupee, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dynduenfb/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "aatmahub_upload";

export default function AdminProductManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    id: '', 
    name: '', 
    price: '', 
    category: '', 
    region: 'India', 
    status: 'active',
    imageUrl: ''
  });

  const productsQuery = useMemo(() => query(collection(db, 'products'), limit(500)), [db]);
  const { data: products, loading: productsLoading } = useCollection(productsQuery);
  const { data: games } = useCollection(query(collection(db, 'games')));

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        region: product.region || 'India', 
        status: product.status || 'active',
        imageUrl: product.imageUrl || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ 
        id: '', 
        name: '', 
        price: '', 
        category: games?.[0]?.id || '', 
        region: 'India', 
        status: 'active',
        imageUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      fd.append("folder", "aatmahub_products");
      
      const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: fd });
      if (!res.ok) throw new Error('Cloudinary rejection');
      const data = await res.json();
      
      setFormData(prev => ({ ...prev, imageUrl: data.secure_url }));
      toast({ title: 'Image Uploaded' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Mandatory fields missing.' });
      return;
    }
    setSaving(true);
    try {
      const pId = formData.id || `${formData.category}-${Date.now()}`;
      await setDoc(doc(db, 'products', pId), { 
        ...formData, 
        id: pId, 
        price: Number(formData.price), 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
      
      toast({ title: "Product Saved", description: `${formData.name} updated successfully.` });
      setIsModalOpen(false);
    } catch (e: any) { 
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message }); 
    } finally { 
      setSaving(false); 
    }
  };

  const forceSyncMlbbIndia = async () => {
    setSaving(true);
    try {
      const gameId = 'mlbb-india';
      const gameRef = doc(db, 'games', gameId);
      await setDoc(gameRef, {
        id: gameId,
        name: "MLBB India",
        slug: gameId,
        category: "Mobile Games",
        status: "active",
        sortOrder: 1,
        flag: "🇮🇳",
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true });

      const mlbbIndiaProducts = [
        { name: "3 Diamonds", price: 7 },
        { name: "5 Diamonds", price: 9 },
        { name: "11 Diamonds", price: 17 },
        { name: "14 Diamonds", price: 23 },
        { name: "22 Diamonds", price: 34 },
        { name: "27 Diamonds", price: 42 },
        { name: "44 Diamonds", price: 67 },
        { name: "56 Diamonds", price: 83 },
      ];

      for (const p of mlbbIndiaProducts) {
        const productId = `mlbb-india-${p.name.toLowerCase().replace(/\s+/g, '-')}`;
        const productData = {
          id: productId,
          name: p.name,
          price: p.price,
          category: gameId,
          region: 'India',
          status: 'active',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'products', productId), productData, { merge: true });
      }

      toast({ 
        title: "MLBB India Synchronized", 
        description: "8 products successfully mapped to MLBB India." 
      });
    } catch (e: any) {
      toast({ variant: 'destructive', title: "Sync Failed", description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase text-white">Catalog Management</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Master Registry for SKUs and Prices</p>
      </header>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="relative flex-1 group w-full">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
             <Input placeholder="Search items by Name, ID or Category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-card border-border pl-12 h-12 rounded-none text-xs font-bold shadow-xl" />
           </div>
           <div className="flex gap-2 w-full md:w-auto">
             <Button onClick={forceSyncMlbbIndia} disabled={saving} variant="outline" className="flex-1 border-primary/20 text-primary h-12 rounded-none font-black uppercase text-[9px] px-6 gap-2 hover:bg-primary/5 shadow-xl">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Sync MLBB India
             </Button>
             <Button onClick={() => handleOpenModal()} className="flex-1 bg-primary h-12 rounded-none font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 gap-2">
                <Plus size={16} /> Add Product
             </Button>
           </div>
        </div>

        {productsLoading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <Card key={p.id} className="bg-card border-border rounded-none overflow-hidden shadow-2xl group hover:border-primary/20 transition-all">
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-start">
                     <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 border border-white/5 relative">
                          {p.imageUrl ? (
                            <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full opacity-20"><ImageIcon size={20} /></div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-primary"><Tag size={10} /><span className="text-[8px] font-black uppercase tracking-widest">{p.category}</span></div>
                          <h3 className="text-sm font-black uppercase tracking-tight text-white">{p.name}</h3>
                          <p className="text-[7px] text-white/20 font-mono uppercase">ID: {p.id}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black text-primary leading-none">₹{p.price}</p>
                        <p className="text-[7px] font-black uppercase opacity-40 mt-1">{p.region}</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleOpenModal(p)} className="flex-1 border-border h-10 rounded-none text-[9px] font-black uppercase tracking-widest hover:bg-white/5">Edit</Button>
                    <Button variant="outline" onClick={() => { if(confirm('Delete this product?')) deleteDoc(doc(db, 'products', p.id)); }} className="border-primary/20 text-primary h-10 w-10 rounded-none flex items-center justify-center"><Trash2 size={14} /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border rounded-none p-8 max-w-xl">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-tighter">Product Information</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <Label className="text-[9px] font-black uppercase">Package Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. 86 Diamonds" className="bg-black/50 border-border h-12 rounded-none text-xs font-bold" />
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-[9px] font-black uppercase">Package Image</Label>
                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-lg">
                  <div className="h-16 w-16 bg-black rounded-lg overflow-hidden border border-white/10 relative">
                    {formData.imageUrl ? <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" /> : <div className="flex items-center justify-center h-full opacity-20"><ImageIcon size={20} /></div>}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="h-9 px-4 text-[10px] font-black uppercase rounded-none w-full border-border">
                      {uploading ? <Loader2 className="animate-spin h-3 w-3" /> : (formData.imageUrl ? 'Change Image' : 'Upload Image')}
                    </Button>
                    {formData.imageUrl && (
                      <button onClick={() => setFormData({...formData, imageUrl: ''})} className="text-[8px] font-black uppercase text-primary tracking-widest hover:underline">Remove Image</button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase">Category</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                  <SelectTrigger className="bg-black/50 border-border h-12 rounded-none font-bold"><SelectValue placeholder="Select Game" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">{games?.map((g) => <SelectItem key={g.id} value={g.id} className="text-[10px] font-black uppercase">{g.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-[9px] font-black uppercase">Price (₹)</Label><div className="relative"><IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary" /><Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="bg-black/50 border-border h-12 rounded-none text-xs font-bold pl-10" /></div></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-none border border-white/5">
              <div className="space-y-0.5"><Label className="text-[10px] font-black uppercase">Active Status</Label></div>
              <Switch checked={formData.status === 'active'} onCheckedChange={(v) => setFormData({...formData, status: v ? 'active' : 'inactive'})} />
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveProduct} disabled={saving} className="w-full bg-primary h-14 rounded-none font-black uppercase text-[11px] shadow-xl shadow-primary/20">{saving ? <Loader2 className="animate-spin" /> : "Save Changes"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
