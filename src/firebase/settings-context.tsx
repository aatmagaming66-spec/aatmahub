
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirestore } from './provider';
import { doc, onSnapshot, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { RankDefinition, DEFAULT_RANKS } from '@/lib/ranks';

interface SettingsContextType {
  siteSettings: any | null;
  ranks: RankDefinition[];
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  siteSettings: null,
  ranks: DEFAULT_RANKS,
  loading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const db = useFirestore();
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [ranks, setRanks] = useState<RankDefinition[]>(DEFAULT_RANKS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Singleton Settings Listener
    const settingsRef = doc(db, 'settings', 'site');
    const unsubSettings = onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) setSiteSettings(snap.data());
    });

    // 2. Fetch Ranks Once (Rarely changes)
    const fetchRanks = async () => {
      try {
        const q = query(collection(db, 'ranks'), orderBy('sortOrder', 'asc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const fetchedRanks = snap.docs.map(d => d.data() as RankDefinition);
          setRanks(fetchedRanks);
        }
      } catch (e) {
        console.error('Failed to fetch ranks, using defaults', e);
      } finally {
        setLoading(false);
      }
    };

    fetchRanks();
    return () => unsubSettings();
  }, [db]);

  return (
    <SettingsContext.Provider value={{ siteSettings, ranks, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useGlobalSettings() {
  return useContext(SettingsContext);
}
