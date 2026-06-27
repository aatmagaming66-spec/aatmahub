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
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [ranks, setRanks] = useState<RankDefinition[]>(DEFAULT_RANKS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen to Global Site Settings (Maintenance, Branding, etc.)
    const siteRef = doc(db, 'settings', 'site');
    const unsubSite = onSnapshot(siteRef, (snap) => {
      if (snap.exists()) {
        setSiteSettings((prev: any) => ({ ...prev, ...snap.data() }));
      }
    });

    // 2. Listen to Homepage Specific Layout Settings (Visibility Toggles)
    const homeRef = doc(db, 'settings', 'homepage');
    const unsubHome = onSnapshot(homeRef, (snap) => {
      if (snap.exists()) {
        setSiteSettings((prev: any) => ({ ...prev, homepage: snap.data() }));
      }
    });

    // 3. Fetch Ranks Once (Rarely changes)
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
    
    return () => {
      unsubSite();
      unsubHome();
    };
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
