'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';

/**
 * useMarketplaceAssets Hook
 * Optimized to provide a high-performance lookup map for marketplace images.
 * Indexes assets by both Document ID and entityId field for maximum reliability.
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
      // 1. Index by Firestore Document ID (Primary identifier used by sync tools)
      if (asset.id) {
        map.set(asset.id, asset);
      }
      // 2. Index by entityId field (Secondary identifier for manual mappings)
      if (asset.entityId && asset.entityId !== asset.id) {
        map.set(asset.entityId, asset);
      }
    });
    return map;
  }, [assets]);

  return { assetsMap, loading };
}
