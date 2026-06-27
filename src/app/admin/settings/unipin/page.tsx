'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * DECOMMISSIONED
 * Redirecting away from removed UniPin integration.
 */
export default function UniPinSettingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin');
  }, [router]);
  return null;
}
