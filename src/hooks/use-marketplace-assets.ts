'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';

/**
 * useMarketplaceAssets Hook
 * Optimized to prevent infinite render loops by stabilizing Firestore references.
 */
export function useMarketplaceAssets() {
  const db = useFirestore();
  
  // MEMOIZED: Stable query reference
  const assetsQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'media_assets');
  }, [db]);

  const { data: assets, loading } = useCollection(assetsQuery);

  // MEMOIZED: Stable lookup map
  const assetsMap = useMemo(() => {
    const map = new Map<string, any>();
    if (!assets || assets.length === 0) return map;
    
    assets.forEach((asset: any) => {
      if (asset.entityId) {
        map.set(asset.entityId, asset);
      }
    });
    return map;
  }, [assets]);

  return { assetsMap, loading };
}
