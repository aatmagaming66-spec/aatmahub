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
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon, Save, X, MoveUp, MoveDown, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dynduenfb/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "aatmahub_upload";

export default function BannerManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    subtitle: '',
    imageUrl: '',
    ctaText: 'Shop Now',
    ctaLink: '/',
    status: 'active',
    sortOrder: 0
  });

  const [file, setFile] = useState<File | null>(null);

  const bannersQuery = useMemo(() => query(collection(db, 'banners'), orderBy('sortOrder', 'asc')), [db]);
  const { data: banners, loading } = useCollection(bannersQuery);

  const handleOpenModal = (banner: any = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        id: banner.id || '',
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        imageUrl: banner.imageUrl || '',
        ctaText: banner.ctaText || 'Shop Now',
        ctaLink: banner.ctaLink || '/',
        status: banner.status || 'active',
        sortOrder: banner.sortOrder || 0
      });
    } else {
      setEditingBanner(null);
      setFormData({
        id: '',
        title: '',
        subtitle: '',
        imageUrl: '',
        ctaText: 'Shop Now',
        ctaLink: '/',
        status: 'active',
        sortOrder: (banners?.length || 0) + 1
      });
    }
    setFile(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      fd.append("folder", "aatmahub_banners");
      const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: fd });
      if (!res.ok) throw new Error('Cloudinary rejection');
      const data = await res.json();
      return data.secure_url;
    } catch (error: any) {
      throw error;
    }
  };

  const handleSave = async () => {
    if (!formData.title && !file && !formData.imageUrl) {
      toast({ variant: 'destructive', title: 'Error', description: 'Image or Title is required.' });
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = formData.imageUrl;

      if (file) {
        finalImageUrl = await handleFileUpload(file);
      }

      const bId = formData.id || `banner-${Date.now()}`;
      const bannerRef = doc(db, 'banners', bId);
      
      const payload = { 
        ...formData,
        id: bId,
        imageUrl: finalImageUrl,
        updatedAt: new Date().toISOString(),
        createdAt: editingBanner?.createdAt || new Date().toISOString()
      };
      
      await setDoc(bannerRef, payload, { merge: true });
      
      toast({ title: 'Success', description: 'Hero banner saved successfully.' });
      setIsModalOpen(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Operation Failed', description: e.message });
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this banner?')) return;
    try {
      await deleteDoc(doc(db, 'banners', id));
      toast({ title: 'Banner Removed' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase text-white">Hero Banners</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Homepage Slider Management</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary h-12 rounded-none font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 gap-2">
          <Plus size={16} /> Add New Slide
        </Button>
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {banners?.map((banner) => (
            <Card key={banner.id} className="bg-card border-border rounded-none overflow-hidden shadow-2xl relative group hover:border-primary/20 transition-all">
              <div className="aspect-[21/9] relative bg-neutral-900 border-b border-border">
                {banner.imageUrl ? (
                  <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon size={40} className="text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 p-6 flex flex-col justify-center">
                   <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none">{banner.title}</h3>
                   <p className="text-[8px] text-white/60 uppercase font-black tracking-widest mt-1">{banner.subtitle}</p>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className={`px-2 py-0.5 rounded-none text-[7px] font-black uppercase border shadow-lg ${banner.status === 'active' ? 'bg-green-500 border-green-400 text-white' : 'bg-primary border-primary/50 text-white'}`}>
                    {banner.status}
                  </div>
                </div>
              </div>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-muted-foreground uppercase">Order: {banner.sortOrder}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenModal(banner)} className="border-border h-9 rounded-none text-[8px] font-black uppercase tracking-widest gap-2 hover:bg-white/5">
                    <Edit2 size={10} /> Edit
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(banner.id)} className="border-primary/20 text-primary hover:bg-primary/5 h-9 w-9 rounded-none flex items-center justify-center">
                    <Trash2 size={12} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {banners?.length === 0 && (
             <div className="col-span-full py-20 text-center border border-dashed border-border">
                <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground opacity-20 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No banners in registry</p>
             </div>
          )}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border rounded-none p-8 max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter text-white">
              {editingBanner ? 'Update Slide' : 'New Banner Slide'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              <div className="p-6 bg-white/5 border border-white/5 rounded-none space-y-4">
                 <div className="flex items-center gap-2">
                   <ImageIcon size={14} className="text-primary" />
                   <span className="text-[9px] font-black uppercase tracking-widest">Banner Resource</span>
                 </div>
                 {formData.imageUrl && !file && (
                   <div className="aspect-[21/9] relative border border-border">
                     <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                   </div>
                 )}
                 <input 
                   type="file" 
                   onChange={(e) => setFile(e.target.files?.[0] || null)} 
                   className="text-[9px] text-muted-foreground file:bg-primary file:text-white file:border-none file:px-4 file:py-2 file:mr-4 file:font-black file:uppercase file:cursor-pointer" 
                   accept="image/*" 
                 />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Main Title</Label>
                <input 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. 50% Off Diamonds" 
                  className="bg-black/50 border-border h-12 rounded-none text-xs font-bold focus:border-primary w-full px-4 outline-none" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Subtitle / Promo</Label>
                <input 
                  value={formData.subtitle} 
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})} 
                  placeholder="Fast • Secure • Reliable" 
                  className="bg-black/50 border-border h-12 rounded-none text-xs font-bold focus:border-primary w-full px-4 outline-none" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Button Text</Label>
                <input 
                  value={formData.ctaText} 
                  onChange={(e) => setFormData({...formData, ctaText: e.target.value})} 
                  className="bg-black/50 border-border h-12 rounded-none text-xs font-bold focus:border-primary w-full px-4 outline-none" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Button Link</Label>
                <input 
                  value={formData.ctaLink} 
                  onChange={(e) => setFormData({...formData, ctaLink: e.target.value})} 
                  className="bg-black/50 border-border h-12 rounded-none text-xs font-bold focus:border-primary w-full px-4 outline-none" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest">Sort Index</Label>
                <input 
                  type="number" 
                  value={formData.sortOrder} 
                  onChange={(e) => setFormData({...formData, sortOrder: Number(e.target.value)})} 
                  className="bg-black/50 border-border h-12 rounded-none text-xs font-bold w-full px-4 outline-none" 
                />
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex items-center justify-between bg-black/50 border border-border h-12 rounded-none px-4">
                  <span className="text-[9px] font-black uppercase text-white/60">Active</span>
                  <Switch 
                    checked={formData.status === 'active'} 
                    onCheckedChange={(v) => setFormData({...formData, status: v ? 'active' : 'inactive'})} 
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-none font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
              {saving ? <Loader2 className="animate-spin h-5 w-5" /> : "Commit Banner Registry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
