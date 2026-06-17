'use client';

/**
 * DEPRECATED: This hook has been replaced by useMarketplaceAssets.
 * Permanently removing old resolution logic.
 */
export function useMediaRegistry() {
  return { getMediaAsset: () => null, loading: false };
}
