'use client';
/**
 * DECOMMISSIONED: Marketplace Assets Hook
 * Legacy logic removed. Returning empty state.
 */
export function useMarketplaceAssets() {
  return { assetsMap: new Map<string, any>(), loading: false };
}
