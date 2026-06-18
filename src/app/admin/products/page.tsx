'use client';

import { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, setDoc, deleteDoc, doc, query, limit, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus, Edit2, Trash2, Loader2, Package, Search, Tag, IndianRupee, Trophy, Save, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_RANKS, type RankDefinition } from '@/lib/ranks';

export default function AdminProductManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: '', name: '', price: '', category: '', region: 'India', tab: 'small', status: 'active'
  });

  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<any>(null);
  const [rankFormData, setRankFormData] = useState<RankDefinition>({
    id: '', name: '', threshold: 0, discount: 0, color: '#DC2626', benefits: [''], detailedBenefits: { discount: '0%', cashback: '0%', priority: 'No', promotions: 'Basic', limitBonus: '0%', accessLevel: 'Basic' }, sortOrder: 0
  });

  const productsQuery = useMemo(() => query(collection(db, 'products'), limit(500)), [db]);
  const { data: products, loading: productsLoading } = useCollection(productsQuery);
  const { data: games } = useCollection(query(collection(db, 'games')));

  const ranksQuery = useMemo(() => query(collection(db, 'ranks'), orderBy('sortOrder', 'asc')), [db]);
  const { data: ranks, loading: ranksLoading } = useCollection<RankDefinition>(ranksQuery);

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
        id: product.id || '', name: product.name || '', price: product.price?.toString() || '',
        category: product.category || '', region: product.region || 'India', tab: product.tab || 'small', status: product.status || 'active'
      });
    } else {
      setEditingProduct(null);
      setFormData({ 
        id: '', name: '', price: '', category: games?.[0]?.id || '', region: 'India', tab: 'small', status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Mandatory fields missing.' });
      return;
    }
    setSaving(true);
    try {
      const pId = formData.id || `${formData.category}-${Date.now()}`;
      await setDoc(doc(db, 'products', pId), { ...formData, id: pId, price: Number(formData.price), updatedAt: new Date().toISOString() }, { merge: true });
      toast({ title: "Product Saved", description: `${formData.name} updated successfully.` });
      setIsModalOpen(false);
    } catch (e: any) { toast({ variant: 'destructive', title: 'Save Failed', description: e.message }); } finally { setSaving(false); }
  };

  /**
   * REINFORCED SYNC: MLBB India Small Packs
   * Ensures 'mlbb-india' game exists and adds the 8 specific products.
   */
  const forceSyncMlbbIndia = async () => {
    setSaving(true);
    try {
      // 1. Ensure the MLBB India Game Record exists (Category Anchor)
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

      // 2. Define the exact product list
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

      // 3. Batch deploy products
      for (const p of mlbbIndiaProducts) {
        const productId = `mlbb-india-small-${p.name.toLowerCase().replace(/\s+/g, '-')}`;
        const productData = {
          id: productId,
          name: p.name,
          price: p.price,
          category: gameId, // Must match Game ID for visibility
          tab: 'small',     // Must match the "Small Packs" filter
          region: 'India',
          status: 'active',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'products', productId), productData, { merge: true });
      }

      toast({ 
        title: "MLBB India Synchronized", 
        description: "8 products successfully mapped to MLBB India -> Small Packs." 
      });
    } catch (e: any) {
      toast({ variant: 'destructive', title: "Sync Failed", description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenRankModal = (rank: any = null) => {
    if (rank) { setEditingRank(rank); setRankFormData(rank); }
    else { setEditingRank(null); setRankFormData({ id: '', name: '', threshold: 0, discount: 0, color: '#DC2626', benefits: [''], detailedBenefits: { discount: '0%', cashback: '0%', priority: 'No', promotions: 'Basic', limitBonus: '0%', accessLevel: 'Basic' }, sortOrder: 0 }); }
    setIsRankModalOpen(true);
  };

  const handleSaveRank = async () => {
    if (!rankFormData.name || !rankFormData.id) return;
    setSaving(true);
    try {
      const filteredBenefits = rankFormData.benefits.filter(b => b.trim() !== '');
      await setDoc(doc(db, 'ranks', rankFormData.id), { ...rankFormData, benefits: filteredBenefits }, { merge: true });
      toast({ title: 'Membership Tier Updated', description: `${rankFormData.name} level synchronized.` });
      setIsRankModalOpen(false);
    } catch (e: any) { toast({ variant: 'destructive', title: 'Save Failed', description: e.message }); } finally { setSaving(false); }
  };

  const seedDefaults = async () => {
    if (!confirm('Deploy standard membership levels?')) return;
    setSaving(true);
    try { for (const rank of DEFAULT_RANKS) { await setDoc(doc(db, 'ranks', rank.id), rank); } toast({ title: 'Membership Levels Restored' }); } catch (e: any) { toast({ variant: 'destructive', title: 'Restore Failed', description: e.message }); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase text-white">Product Management</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Master Registry for SKUs and Membership Levels</p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card border border-border h-14 p-1.5 rounded-none mb-8 w-full max-w-md">
          <TabsTrigger value="inventory" className="flex-1 text-[10px] font-black uppercase rounded-none data-[state=active]:bg-primary">Product List</TabsTrigger>
          <TabsTrigger value="ranks" className="flex-1 text-[10px] font-black uppercase rounded-none data-[state=active]:bg-primary">Membership Levels</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
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
                       <div className="space-y-1">
                          <div className="flex items-center gap-1 text-primary"><Tag size={10} /><span className="text-[8px] font-black uppercase tracking-widest">{p.category}</span></div>
                          <h3 className="text-sm font-black uppercase tracking-tight text-white">{p.name}</h3>
                          <p className="text-[7px] text-white/20 font-mono uppercase">ID: {p.id}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-lg font-black text-primary leading-none">₹{p.price}</p>
                          <p className="text-[7px] font-black uppercase opacity-40 mt-1">{p.tab} • {p.region}</p>
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
        </TabsContent>

        <TabsContent value="ranks" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="bg-accent/5 p-6 rounded-none border border-accent/10 space-y-2 flex-1 mr-4">
               <div className="flex items-center gap-2 text-accent"><Trophy className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">Membership Control</span></div>
               <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Manage spending requirements and reward tiers.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={seedDefaults} className="border-border rounded-none font-black uppercase text-[9px] h-12 px-6">Restore Defaults</Button>
              <Button onClick={() => handleOpenRankModal()} className="bg-primary h-12 rounded-none font-black uppercase text-[10px] px-8 shadow-xl shadow-primary/20 gap-2"><Plus size={16} /> New Tier</Button>
            </div>
          </div>
          {ranksLoading ? (
            <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ranks?.map((rank) => (
                <Card key={rank.id} className="bg-card border-border rounded-none overflow-hidden shadow-2xl group hover:border-primary/20 transition-all">
                  <CardContent className="p-6 space-y-5">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-none bg-white/5 flex items-center justify-center" style={{ color: rank.color }}><Trophy size={20} /></div>
                          <div><h3 className="text-sm font-black uppercase tracking-tight">{rank.name}</h3><p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">₹{rank.threshold.toLocaleString()} Needed</p></div>
                       </div>
                       <div className="text-right"><p className="text-lg font-black text-primary">{rank.discount}%</p><p className="text-[7px] font-black uppercase">Discount</p></div>
                    </div>
                    <Button variant="outline" onClick={() => handleOpenRankModal(rank)} className="w-full border-border h-10 rounded-none text-[9px] font-black uppercase tracking-widest hover:bg-white/5">Settings</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border rounded-none p-8 max-w-xl">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-tighter">Product Information</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2"><Label className="text-[9px] font-black uppercase">Package Name</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. 86 Diamonds" className="bg-black/50 border-border h-12 rounded-none text-xs font-bold" /></div>
              <div className="space-y-2"><Label className="text-[9px] font-black uppercase">Category</Label>
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

      <Dialog open={isRankModalOpen} onOpenChange={setIsRankModalOpen}>
        <DialogContent className="bg-card border-border rounded-none p-8 max-w-xl overflow-y-auto max-h-[90vh]">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-tighter">Level Configuration</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-6">
            <div className="space-y-2"><Label className="text-[9px] font-black uppercase">Level ID</Label><Input value={rankFormData.id} disabled={!!editingRank} onChange={(e) => setRankFormData({...rankFormData, id: e.target.value})} placeholder="warrior" className="bg-black/50 border-border h-12 rounded-none text-xs font-bold" /></div>
            <div className="space-y-2"><Label className="text-[9px] font-black uppercase">Display Name</Label><Input value={rankFormData.name} onChange={(e) => setRankFormData({...rankFormData, name: e.target.value})} placeholder="Warrior" className="bg-black/50 border-border h-12 rounded-none text-xs font-bold" /></div>
            <div className="space-y-2"><Label className="text-[9px] font-black uppercase">Threshold (₹)</Label><Input type="number" value={rankFormData.threshold} onChange={(e) => setRankFormData({...rankFormData, threshold: Number(e.target.value)})} className="bg-black/50 border-border h-12 rounded-none text-xs font-bold" /></div>
            <div className="space-y-2"><Label className="text-[9px] font-black uppercase">Discount (%)</Label><Input type="number" value={rankFormData.discount} onChange={(e) => setRankFormData({...rankFormData, discount: Number(e.target.value)})} className="bg-black/50 border-border h-12 rounded-none text-xs font-bold" /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveRank} disabled={saving} className="w-full bg-primary h-14 rounded-none font-black uppercase text-[11px] tracking-widest">{saving ? <Loader2 className="animate-spin" /> : "Commit Level Update"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
