'use client';

import { useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

/**
 * useMarketplaceAssets Hook
 * Memoizes the collection reference to prevent infinite render loops.
 */
export function useMarketplaceAssets() {
  const db = useFirestore();
  
  const assetsQuery = useMemo(() => collection(db, 'media_assets'), [db]);
  const { data: assets, loading } = useCollection(assetsQuery);

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
