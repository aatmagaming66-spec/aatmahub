'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * DECOMMISSIONED
 * Redirecting away from removed MooGold integration.
 */
export default function MooGoldSettingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin');
  }, [router]);
  return null;
}
