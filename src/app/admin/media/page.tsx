'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useStorage } from '@/firebase/provider';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Palette, Loader2, Save, Sparkles, Upload, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default function MediaManagementPage() {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const brandingRef = useMemo(() => doc(db, 'settings', 'branding'), [db]);
  const { data: branding, loading } = useDoc(brandingRef);

  const [saving, setSaving] = useState(false);
  const [siteTitle, setSiteTitle] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [heroBannerUrl, setHeroBannerUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (branding) {
      setSiteTitle(branding.heroTitle || '');
      setLogoUrl(branding.logoUrl || '');
      setHeroBannerUrl(branding.heroBannerUrl || '');
      setFaviconUrl(branding.faviconUrl || '');
    }
  }, [branding]);

  const handleFileUpload = async (file: File, type: string) => {
    if (!file) return;
    
    const storageRef = ref(storage, `branding/${type}_${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(prev => ({ ...prev, [type]: progress }));
      }, 
      (error) => {
        toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        if (type === 'logo') setLogoUrl(downloadURL);
        if (type === 'hero') setHeroBannerUrl(downloadURL);
        if (type === 'favicon') setFaviconUrl(downloadURL);
        toast({ title: 'Asset Prepared', description: `${type.toUpperCase()} uploaded successfully.` });
      }
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      heroTitle: siteTitle,
      logoUrl,
      heroBannerUrl,
      faviconUrl,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(brandingRef, data, { merge: true });
      toast({ title: 'Branding Synchronized', description: 'Site identity updated successfully.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Sync Failed', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Media Hub</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Identity & Visual Assets</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border bg-black/20">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" /> Visual Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Website Branding</Label>
              <Input 
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                placeholder="AATMA HUB"
                className="bg-black/50 border-border h-14 rounded-2xl focus:border-primary font-bold text-sm"
              />
            </div>

            <MediaUploadField 
              label="Platform Logo"
              value={logoUrl}
              onUrlChange={setLogoUrl}
              onFileSelect={(f) => handleFileUpload(f, 'logo')}
              progress={uploadProgress['logo']}
            />

            <MediaUploadField 
              label="Hero Banner"
              value={heroBannerUrl}
              onUrlChange={setHeroBannerUrl}
              onFileSelect={(f) => handleFileUpload(f, 'hero')}
              progress={uploadProgress['hero']}
            />

            <MediaUploadField 
              label="Favicon (32x32)"
              value={faviconUrl}
              onUrlChange={setFaviconUrl}
              onFileSelect={(f) => handleFileUpload(f, 'favicon')}
              progress={uploadProgress['favicon']}
            />

            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest mt-4 shadow-xl shadow-primary/10">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Save Global Configuration</>}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card border-border rounded-[2rem] p-8 shadow-2xl overflow-hidden">
             <h3 className="text-xs font-black uppercase tracking-widest mb-6">Live Identity Preview</h3>
             <div className="space-y-8">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                   {logoUrl ? (
                     <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-white/10 bg-black">
                       <Image src={logoUrl} alt="Logo Preview" fill className="object-contain p-1" />
                     </div>
                   ) : <div className="h-12 w-12 rounded-lg bg-black/40 flex items-center justify-center text-white/20"><ImageIcon size={20} /></div>}
                   <div>
                     <p className="text-sm font-black uppercase tracking-tight text-white">{siteTitle || 'AATMA HUB'}</p>
                     <p className="text-[8px] text-muted-foreground uppercase font-black">Header Preview</p>
                   </div>
                </div>

                <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40 flex items-center justify-center">
                   {heroBannerUrl ? (
                     <Image src={heroBannerUrl} alt="Banner Preview" fill className="object-cover opacity-60" />
                   ) : <ImageIcon size={40} className="text-white/10" />}
                   <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                   <p className="absolute bottom-6 left-6 text-xl font-black uppercase tracking-tighter">{siteTitle || 'AATMA HUB'}</p>
                </div>
             </div>
          </Card>

          <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Media Protocol</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
              Branding changes reflect instantly for all users. Ensure favicon images are precisely 32x32px for optimal browser compatibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaUploadField({ label, value, onUrlChange, onFileSelect, progress }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</Label>
        {progress > 0 && progress < 100 && (
          <span className="text-[8px] font-black text-primary animate-pulse">UPLOADING...</span>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input 
            value={value}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="Image URL or fallback..."
            className="bg-black/50 border-border h-12 rounded-xl focus:border-primary text-xs font-bold pl-4 pr-10"
          />
          {value && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
        </div>
        <div className="relative">
          <input 
            type="file" 
            id={`file-${label}`} 
            className="hidden" 
            onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
            accept="image/*"
          />
          <Button 
            variant="outline" 
            asChild
            className="h-12 w-12 rounded-xl border-border bg-white/5 hover:bg-primary transition-all p-0 cursor-pointer"
          >
            <label htmlFor={`file-${label}`}>
              <Upload size={16} />
            </label>
          </Button>
        </div>
      </div>
      {progress > 0 && progress < 100 && <Progress value={progress} className="h-1 bg-white/5" />}
    </div>
  );
}
