'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { doc, onSnapshot } from 'firebase/firestore';
import { Megaphone, X } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function AnnouncementBar() {
  const db = useFirestore();
  const { user } = useUser();
  const [data, setData] = useState<any>(null);
  const [dismissed, setVisible] = useState(false);

  useEffect(() => {
    // Only initialize listener if user is authenticated to avoid permission errors
    if (!user) {
      setData(null);
      return;
    }

    const docRef = doc(db, 'settings', 'site');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setData(snap.data());
      }
    }, async (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'get'
        }));
      }
    });
    return () => unsub();
  }, [db, user]);

  if (!data?.announcementEnabled || !data?.announcementText || dismissed) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-primary to-accent py-2 px-4 animate-in slide-in-from-top duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
      <div className="relative z-10 flex items-center justify-center gap-3">
        <Megaphone className="h-3 w-3 text-white animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white text-center leading-tight">
          {data.announcementText}
        </p>
        <button 
          onClick={() => setVisible(true)}
          className="ml-2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="h-3 w-3 text-white" />
        </button>
      </div>
    </div>
  );
}