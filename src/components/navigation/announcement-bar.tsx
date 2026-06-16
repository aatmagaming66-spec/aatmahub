
'use client';

import { useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import { useGlobalSettings } from '@/firebase/settings-context';

export function AnnouncementBar() {
  const { siteSettings } = useGlobalSettings();
  const [dismissed, setDismissed] = useState(false);

  if (!siteSettings?.announcementEnabled || !siteSettings?.announcementText || dismissed) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-primary to-accent py-2 px-4 animate-in slide-in-from-top duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
      <div className="relative z-10 flex items-center justify-center gap-3">
        <Megaphone className="h-3 w-3 text-white animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white text-center leading-tight">
          {siteSettings.announcementText}
        </p>
        <button 
          onClick={() => setDismissed(true)}
          className="ml-2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="h-3 w-3 text-white" />
        </button>
      </div>
    </div>
  );
}
