'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useStorage } from '@/firebase/provider';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ImageIcon, Upload, Trash2, Loader2, Save, Sparkles, Image as ImageIcon2, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default function MediaManagementPage() {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const brandingRef = useMemo(() => doc(db, 'settings', 'branding'), [db]);
  const { data: branding, loading } = useDoc(brandingRef);

  const [uploading, setUploading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (file: File, key: string) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File Too Large', description: 'Maximum size is 5MB.' });
      return;
    }

    setUploading(key);
    setProgress(0);

    const storageRef = ref(storage, `branding/${key}_${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      },
      (error) => {
        setUploading(null);
        toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        try {
          await setDoc(brandingRef, { [key]: downloadURL, updatedAt: new Date().toISOString() }, { merge: true });
          toast({ title: 'Asset Deployed', description: `Website ${key} synchronized successfully.` });
        } catch (e: any) {
          toast({ variant: 'destructive', title: 'Firestore Sync Failed', description: e.message });
        } finally {
          setUploading(null);
          setProgress(0);
        }
      }
    );
  };

  const removeAsset = async (key: string) => {
    if (!confirm('Are you sure you want to remove this asset?')) return;
    try {
      await setDoc(brandingRef, { [key]: '', updatedAt: new Date().toISOString() }, { merge: true });
      toast({ title: 'Asset Removed', description: 'Placeholder restored for this slot.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Operation Failed', description: e.message });
    }
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;

  const MEDIA_SLOTS = [
    { key: 'logoUrl', label: 'Website Logo', desc: 'Main brand identification' },
    { key: 'faviconUrl', label: 'Site Favicon', desc: 'Browser tab icon' },
    { key: 'heroBannerUrl', label: 'Main Hero Banner', desc: 'Primary homepage display' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Media Hub</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Visual Asset Management (Firebase Storage)</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MEDIA_SLOTS.map((slot) => {
          const currentUrl = (branding as any)?.[slot.key];
          const isSlotUploading = uploading === slot.key;

          return (
            <Card key={slot.key} className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
              <CardHeader className="p-6 border-b border-border bg-black/20">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center justify-between">
                  <div className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" /> {slot.label}</div>
                  {currentUrl && <CheckCircle2 size={12} className="text-green-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/50 border border-dashed border-white/10 flex items-center justify-center group">
                  {currentUrl ? (
                    <Image 
                      src={currentUrl} 
                      alt={slot.label} 
                      fill 
                      className="object-contain p-4" 
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon2 size={40} className="opacity-20" />
                      <span className="text-[10px] font-black uppercase tracking-widest">No Asset Uploaded</span>
                    </div>
                  )}
                  
                  {isSlotUploading && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 space-y-4">
                       <Loader2 className="h-8 w-8 text-primary animate-spin" />
                       <div className="w-full space-y-2 text-center">
                          <Progress value={progress} className="h-1.5 bg-white/10" />
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest">{Math.round(progress)}% Transmitted</p>
                       </div>
                    </div>
                  )}

                  {!isSlotUploading && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Label htmlFor={`file-${slot.key}`} className="cursor-pointer bg-primary p-3 rounded-full shadow-xl hover:scale-110 transition-transform">
                          <Upload size={20} className="text-white" />
                       </Label>
                       <input 
                         id={`file-${slot.key}`} 
                         type="file" 
                         className="hidden" 
                         accept="image/png, image/jpeg, image/webp" 
                         onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, slot.key);
                         }} 
                       />
                    </div>
                  )}
                </div>

                <div className="space-y-4 mt-auto">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{slot.desc}</p>
                    {currentUrl && (
                      <p className="text-[7px] text-white/20 font-mono truncate max-w-full">{currentUrl}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Label 
                      htmlFor={`file-${slot.key}`} 
                      className="flex-1 bg-white/5 border border-white/5 h-12 rounded-xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer"
                    >
                      <Upload size={14} className="mr-2" /> {currentUrl ? "Replace" : "Upload"}
                    </Label>
                    {currentUrl && (
                      <Button 
                        variant="outline" 
                        className="border-border hover:bg-red-500/10 hover:text-red-500 h-12 w-12 rounded-xl flex items-center justify-center"
                        onClick={() => removeAsset(slot.key)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3 max-w-2xl">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Branding Protocol</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          Assets are uploaded to Firebase Storage and served via high-performance edge nodes. Preferred resolution: Logo (512x512 PNG), Banner (1200x600 JPG). Changes reflect instantly across all client headers.
        </p>
      </div>
    </div>
  );
}
