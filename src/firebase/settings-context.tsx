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
    // 1. Listen to Unified Master Settings Document
    // This single doc now contains: site config, homepage toggles, and branding
    const masterRef = doc(db, 'settings', 'site');
    const unsubMaster = onSnapshot(masterRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSiteSettings(data);
      } else {
        // Fallback defaults if doc doesn't exist
        setSiteSettings({
          maintenanceMode: false,
          siteBranding: 'AATMA HUB',
          homepage: {
            showGames: true,
            showSocial: true,
            showLiveActivity: true,
            showTrustBadges: true,
          }
        });
      }
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
    
    return () => {
      unsubMaster();
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
