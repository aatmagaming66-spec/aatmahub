'use client';

import { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, query, doc, setDoc, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Upload, 
  Trash2, 
  Loader2, 
  Images, 
  Gamepad2, 
  Tv, 
  Share2, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function ImageManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch all marketplace items
  const { data: games, loading: gamesLoading } = useCollection(query(collection(db, 'games')));
  const { data: ott, loading: ottLoading } = useCollection(query(collection(db, 'ott_services')));
  const { data: social, loading: socialLoading } = useCollection(query(collection(db, 'social_services')));

  const allItems = useMemo(() => {
    const g = games.map(item => ({ ...item, type: 'games', icon: Gamepad2 }));
    const o = ott.map(item => ({ ...item, type: 'ott_services', icon: Tv }));
    const s = social.map(item => ({ ...item, type: 'social_services', icon: Share2 }));
    return [...g, ...o, ...s];
  }, [games, ott, social]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allItems, searchQuery]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, id: string, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ variant: 'destructive', title: 'Invalid Format', description: 'Please upload JPG, PNG, or WEBP.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File Too Large', description: 'Maximum file size is 5MB.' });
      return;
    }

    setUpdatingId(id);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        await setDoc(doc(db, type, id), { cardImage: base64, updatedAt: new Date().toISOString() }, { merge: true });
        toast({ title: 'Image Updated', description: 'Marketplace asset synchronized successfully.' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
      } finally {
        setUpdatingId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = async (id: string, type: string) => {
    if (!confirm('Are you sure you want to remove this image?')) return;
    setUpdatingId(id);
    try {
      await setDoc(doc(db, type, id), { cardImage: '', updatedAt: new Date().toISOString() }, { merge: true });
      toast({ title: 'Image Removed', description: 'Asset cleared from registry.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Removal Failed', description: error.message });
    } finally {
      setUpdatingId(null);
    }
  };

  const loading = gamesLoading || ottLoading || socialLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Image Management</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Global Marketplace Assets</p>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search items by name..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border pl-12 h-14 rounded-2xl text-xs font-bold focus:border-primary shadow-xl"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[2.5rem] p-20 text-center space-y-4">
           <Images className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">No digital assets found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl group hover:border-primary/20 transition-all">
              <CardContent className="p-0">
                {/* Image Preview Area */}
                <div className="relative aspect-video w-full bg-black/40 overflow-hidden">
                  {item.cardImage ? (
                    <Image 
                      src={item.cardImage} 
                      alt={item.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                      <item.icon size={40} className="opacity-10" />
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-30">No Image Uploaded</span>
                    </div>
                  )}
                  
                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3 z-20">
                    <div className="bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-1.5 border border-white/10">
                      <item.icon size={10} className="text-primary" />
                      <span className="text-[8px] font-black uppercase text-white/70">{item.type.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {updatingId === item.id && (
                    <div className="absolute inset-0 z-30 bg-black/60 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                  )}
                </div>

                {/* Info & Actions */}
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight truncate">{item.name}</h3>
                    <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{item.id}</p>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input 
                        type="file" 
                        id={`file-${item.id}`} 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, item.id, item.type)}
                      />
                      <Label 
                        htmlFor={`file-${item.id}`} 
                        className="flex items-center justify-center gap-2 w-full h-11 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-white transition-all rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest"
                      >
                        <Upload size={14} /> Replace
                      </Label>
                    </div>
                    {item.cardImage && (
                      <Button 
                        variant="outline" 
                        onClick={() => removeImage(item.id, item.type)}
                        className="h-11 w-11 rounded-xl border-border hover:bg-red-500/10 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3 max-w-2xl">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Protocol Guidance</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          Assets uploaded here are compressed and stored as Base64 strings. High-contrast marketplace images work best for card grids. Changes reflect instantly on all active client sessions.
        </p>
      </div>
    </div>
  );
}