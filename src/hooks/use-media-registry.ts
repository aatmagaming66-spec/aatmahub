'use client';

import { useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

/**
 * Unified Media Registry Hook
 * Provides a high-performance lookup map for branding assets.
 */
export function useMediaRegistry() {
  const db = useFirestore();
  const mediaQuery = useMemo(() => collection(db, 'media_assets'), [db]);
  const { data: mediaAssets, loading } = useCollection(mediaQuery);

  const mediaMap = useMemo(() => {
    const map: Record<string, any> = {};
    if (!mediaAssets) return map;
    
    mediaAssets.forEach((asset: any) => {
      if (asset.entityId) {
        map[asset.entityId] = {
          logoUrl: asset.logoUrl || null,
          thumbnailUrl: asset.thumbnailUrl || null,
          bannerUrl: asset.bannerUrl || null,
          entityName: asset.entityName || ''
        };
      }
    });
    return map;
  }, [mediaAssets]);

  const getMediaAsset = (entityId: string) => {
    return mediaMap[entityId] || null;
  };

  return { getMediaAsset, loading };
}
