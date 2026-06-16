'use client';

import { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Upload, 
  RefreshCcw, 
  Trash2, 
  Save, 
  Gamepad2, 
  Tv, 
  Share2, 
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  name: string;
  type: 'branding' | 'game' | 'ott' | 'social';
  status: 'active' | 'inactive';
  lastUpdated: string;
}

const BRANDING_ITEMS: MediaItem[] = [
  { id: 'logo', name: 'Website Logo', type: 'branding', status: 'active', lastUpdated: '2024-05-20' },
  { id: 'favicon', name: 'Favicon (32x32)', type: 'branding', status: 'active', lastUpdated: '2024-05-20' },
  { id: 'hero', name: 'Main Hero Banner', type: 'branding', status: 'active', lastUpdated: '2024-05-20' },
];

const GAME_ITEMS: MediaItem[] = [
  { id: 'ml-in', name: 'MLBB India', type: 'game', status: 'active', lastUpdated: '2024-05-18' },
  { id: 'ml-id', name: 'MLBB Indonesia', type: 'game', status: 'active', lastUpdated: '2024-05-18' },
  { id: 'ml-ph', name: 'MLBB Philippines', type: 'game', status: 'active', lastUpdated: '2024-05-18' },
  { id: 'ml-my', name: 'MLBB Malaysia', type: 'game', status: 'active', lastUpdated: '2024-05-18' },
  { id: 'ml-sg', name: 'MLBB Singapore', type: 'game', status: 'active', lastUpdated: '2024-05-18' },
  { id: 'ml-ru', name: 'MLBB Russia', type: 'game', status: 'active', lastUpdated: '2024-05-18' },
  { id: 'ml-br', name: 'MLBB Brazil', type: 'game', status: 'active', lastUpdated: '2024-05-18' },
  { id: 'mc-go', name: 'Magic Chess Go Go', type: 'game', status: 'active', lastUpdated: '2024-05-18' },
  { id: 'hok', name: 'Honor of Kings', type: 'game', status: 'active', lastUpdated: '2024-05-18' },
  { id: 'bgmi', name: 'BGMI', type: 'game', status: 'active', lastUpdated: '2024-05-18' },
];

const OTT_ITEMS: MediaItem[] = [
  { id: 'netflix', name: 'Netflix', type: 'ott', status: 'active', lastUpdated: '2024-05-15' },
  { id: 'prime', name: 'Amazon Prime', type: 'ott', status: 'active', lastUpdated: '2024-05-15' },
  { id: 'yt-prem', name: 'YouTube Premium', type: 'ott', status: 'active', lastUpdated: '2024-05-15' },
  { id: 'spotify', name: 'Spotify', type: 'ott', status: 'active', lastUpdated: '2024-05-15' },
];

const SOCIAL_ITEMS: MediaItem[] = [
  { id: 'insta', name: 'Instagram', type: 'social', status: 'active', lastUpdated: '2024-05-12' },
  { id: 'fb', name: 'Facebook', type: 'social', status: 'active', lastUpdated: '2024-05-12' },
  { id: 'tg', name: 'Telegram', type: 'social', status: 'active', lastUpdated: '2024-05-12' },
  { id: 'yt-social', name: 'YouTube', type: 'social', status: 'active', lastUpdated: '2024-05-12' },
];

export default function MediaManagerPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filterItems = (items: MediaItem[]) => 
    items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredBranding = useMemo(() => filterItems(BRANDING_ITEMS), [searchQuery]);
  const filteredGames = useMemo(() => filterItems(GAME_ITEMS), [searchQuery]);
  const filteredOtt = useMemo(() => filterItems(OTT_ITEMS), [searchQuery]);
  const filteredSocial = useMemo(() => filterItems(SOCIAL_ITEMS), [searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* HEADER & SEARCH */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase leading-none text-white">Media Manager 2.0</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60 mt-2">Visual Asset Distribution Hub</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search assets by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card border-border pl-12 h-14 rounded-2xl text-xs font-bold focus:border-primary shadow-xl ring-0 focus-visible:ring-offset-0 focus-visible:ring-0"
          />
        </div>
      </header>

      {/* 1. BRANDING SECTION */}
      <MediaSection 
        title="Branding Identity" 
        icon={Palette} 
        count={filteredBranding.length}
        items={filteredBranding}
        accent="text-primary"
      />

      {/* 2. MOBILE GAMES SECTION */}
      <MediaSection 
        title="Mobile Games Catalog" 
        icon={Gamepad2} 
        count={filteredGames.length}
        items={filteredGames}
        accent="text-accent"
      />

      {/* 3. OTT SERVICES SECTION */}
      <MediaSection 
        title="OTT Distribution" 
        icon={Tv} 
        count={filteredOtt.length}
        items={filteredOtt}
        accent="text-primary"
      />

      {/* 4. SOCIAL SERVICES SECTION */}
      <MediaSection 
        title="Social Growth Hub" 
        icon={Share2} 
        count={filteredSocial.length}
        items={filteredSocial}
        accent="text-accent"
      />

      {/* SYSTEM NOTE */}
      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Media Protocol</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          Changes to media assets are stored in the temporary hydration layer. Press "Save Changes" on each card to commit updates to the global marketplace records. Recommended resolution for game cards is 800x600px.
        </p>
      </div>
    </div>
  );
}

function MediaSection({ title, icon: Icon, count, items, accent }: any) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className={cn("h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center shadow-inner", accent)}>
            <Icon size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">{title}</h2>
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{count} Managed Entities</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item: MediaItem) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  const [isEnabled, setIsEnabled] = useState(item.status === 'active');

  return (
    <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl group hover:border-primary/20 transition-all duration-500">
      {/* IMAGE PREVIEW AREA */}
      <div className="relative aspect-video w-full bg-black/40 border-b border-white/5 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-black/60 pointer-events-none" />
        <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
           <ImageIcon size={40} className="text-white" />
           <span className="text-[8px] font-black uppercase tracking-[0.3em]">No Image Detected</span>
        </div>
        
        {/* TOP OVERLAYS */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <Badge className={cn(
            "text-[7px] font-black uppercase px-2 py-0.5 rounded-md border tracking-tighter",
            isEnabled ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-primary/10 text-primary border-primary/20"
          )}>
            {isEnabled ? 'Operational' : 'Disabled'}
          </Badge>
          <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 pointer-events-auto shadow-xl">
             <Switch 
               checked={isEnabled} 
               onCheckedChange={setIsEnabled}
               className="data-[state=checked]:bg-green-500 h-4 w-8 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-4"
             />
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* ENTITY INFO */}
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">{item.name}</h3>
          <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-1.5">
            <RefreshCcw size={8} /> Last Updated: {item.lastUpdated}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-10 rounded-xl border-border bg-white/5 hover:bg-primary hover:text-white text-[9px] font-black uppercase tracking-widest gap-2 transition-all">
            <Upload size={14} /> Upload
          </Button>
          <Button variant="outline" className="h-10 rounded-xl border-border bg-white/5 hover:bg-accent hover:text-white text-[9px] font-black uppercase tracking-widest gap-2 transition-all">
            <RefreshCcw size={14} /> Replace
          </Button>
          <Button variant="outline" className="h-10 rounded-xl border-primary/10 bg-primary/5 text-primary hover:bg-primary hover:text-white text-[9px] font-black uppercase tracking-widest gap-2 transition-all">
            <Trash2 size={14} /> Remove
          </Button>
          <Button className="h-10 rounded-xl bg-primary text-white shadow-xl shadow-primary/20 text-[9px] font-black uppercase tracking-widest gap-2 transition-all">
            <Save size={14} /> Save Card
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
