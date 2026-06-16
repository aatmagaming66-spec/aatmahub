'use client';

import { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, setDoc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ImageIcon, Upload, Trash2, Loader2, Save, Sparkles, Image as ImageIcon2 } from 'lucide-react';
import Image from 'next/image';

export default function MediaManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const brandingRef = useMemo(() => doc(db, 'settings', 'branding'), [db]);
  const { data: branding, loading } = useDoc(brandingRef);

  const [saving, setSaving] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File Too Large', description: 'Maximum size is 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [key]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMedia = async (key: string) => {
    if (!previews[key]) return;
    setSaving(true);
    try {
      await setDoc(brandingRef, { [key]: previews[key], updatedAt: new Date().toISOString() }, { merge: true });
      toast({ title: 'Asset Deployed', description: `Media updated successfully.` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;

  const MEDIA_SLOTS = [
    { key: 'logoUrl', label: 'Website Logo', desc: 'Main brand identification' },
    { key: 'faviconUrl', label: 'Site Favicon', desc: 'Browser tab icon' },
    { key: 'heroBannerUrl', label: 'Main Hero Banner', desc: 'Primary homepage display' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Media Hub</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Visual Asset Management</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {MEDIA_SLOTS.map((slot) => (
          <Card key={slot.key} className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl">
            <CardHeader className="p-6 border-b border-border bg-black/20">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" /> {slot.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/50 border border-dashed border-white/10 flex items-center justify-center group">
                {previews[slot.key] || (branding as any)?.[slot.key] ? (
                  <Image 
                    src={previews[slot.key] || (branding as any)?.[slot.key]} 
                    alt={slot.label} 
                    fill 
                    className="object-contain" 
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon2 size={40} className="opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Asset Detected</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Label htmlFor={`file-${slot.key}`} className="cursor-pointer bg-primary p-3 rounded-full shadow-xl">
                      <Upload size={20} className="text-white" />
                   </Label>
                   <input 
                     id={`file-${slot.key}`} 
                     type="file" 
                     className="hidden" 
                     accept="image/*" 
                     onChange={(e) => handleFileChange(e, slot.key)} 
                   />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{slot.desc}</p>
                <div className="flex gap-2">
                  <Button 
                    disabled={!previews[slot.key] || saving} 
                    onClick={() => handleSaveMedia(slot.key)}
                    className="flex-1 bg-primary h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
                  >
                    {saving ? <Loader2 className="animate-spin" /> : <><Save size={12} className="mr-2" /> Save Asset</>}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-border hover:bg-white/5 h-12 w-12 rounded-xl flex items-center justify-center text-primary"
                    onClick={() => setPreviews(p => { const n = {...p}; delete n[slot.key]; return n; })}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3 max-w-2xl">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Media Protocol</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          Assets are compressed automatically before transmission. Use .PNG or .JPG formats. Maximum file size per asset is 5MB for optimal kernel performance.
        </p>
      </div>
    </div>
  );
}
