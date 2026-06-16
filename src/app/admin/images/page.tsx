'use client';

import { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Loader2, 
  Gamepad2, 
  Tv, 
  Share2, 
  AlertCircle,
  Database,
  ImageIcon
} from 'lucide-react';
import Image from 'next/image';

export default function EntityRegistryPage() {
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');

  const gamesQuery = useMemo(() => query(collection(db, 'games')), [db]);
  const ottQuery = useMemo(() => query(collection(db, 'ott_services')), [db]);
  const socialQuery = useMemo(() => query(collection(db, 'social_services')), [db]);

  const { data: games, loading: gamesLoading } = useCollection(gamesQuery);
  const { data: ott, loading: ottLoading } = useCollection(ottQuery);
  const { data: social, loading: socialLoading } = useCollection(socialQuery);

  const allItems = useMemo(() => {
    const g = (games || []).map(item => ({ ...item, type: 'games', icon: Gamepad2 }));
    const o = (ott || []).map(item => ({ ...item, type: 'ott_services', icon: Tv }));
    const s = (social || []).map(item => ({ ...item, type: 'social_services', icon: Share2 }));
    return [...g, ...o, ...s];
  }, [games, ott, social]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allItems, searchQuery]);

  const loading = gamesLoading || ottLoading || socialLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Entity Registry</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Master Marketplace Records</p>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search marketplace entities..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border pl-12 h-14 rounded-2xl text-xs font-bold shadow-xl"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[2.5rem] p-20 text-center space-y-4">
           <Database className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">No entities found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={`${item.type}-${item.id}`} className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl group hover:border-primary/20 transition-all">
              <div className="relative h-24 w-full bg-black/40 border-b border-white/5">
                 {(item.icon && item.icon.startsWith?.('http')) || item.banner || item.cardImage ? (
                   <Image src={item.icon.startsWith?.('http') ? item.icon : (item.cardImage || item.banner)} alt={item.name} fill className="object-cover opacity-40" />
                 ) : (
                   <div className="h-full w-full flex items-center justify-center opacity-10"><item.icon size={30} /></div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-black border border-white/5 flex items-center justify-center">
                    {item.icon.startsWith?.('http') ? (
                      <div className="relative h-6 w-6"><Image src={item.icon} alt="" fill className="object-contain" /></div>
                    ) : <item.icon size={18} className="text-primary opacity-40" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight truncate max-w-[150px]">{item.name}</h3>
                    <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{item.type.replace('_', ' ')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Identity Intelligence</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
          Registry entities are mapped to global distribution keys. Modifying media here will automatically update the public hubs.
        </p>
      </div>
    </div>
  );
}
