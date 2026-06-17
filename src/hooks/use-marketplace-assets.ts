'use client';

import { useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

/**
 * useMarketplaceAssets Hook
 * Single source of truth for all marketplace branding.
 * Responsibilities:
 * 1. Load media_assets collection directly.
 * 2. Create a high-performance lookup Map.
 * 3. Return direct asset objects.
 */
export function useMarketplaceAssets() {
  const db = useFirestore();
  const { data: assets, loading } = useCollection(collection(db, 'media_assets'));

  const assetsMap = useMemo(() => {
    const map = new Map<string, any>();
    if (!assets) return map;
    
    assets.forEach((asset: any) => {
      if (asset.entityId) {
        map.set(asset.entityId, asset);
      }
    });
    return map;
  }, [assets]);

  return { assetsMap, loading };
}
