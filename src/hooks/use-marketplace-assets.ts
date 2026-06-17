'use client';

/**
 * DEPRECATED: This hook has been decommissioned as part of the Media Hub removal.
 * Returning empty map to maintain interface compatibility during Phase 1.
 */
export function useMarketplaceAssets() {
  return { 
    assetsMap: new Map<string, any>(), 
    loading: false 
  };
}