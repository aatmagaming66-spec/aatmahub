'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';

/**
 * Silent Redirector
 * Orchestrates session routing without visual weight.
 */
export default function AccountRedirect() {
  const { user, initialized } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (initialized) {
      router.replace(user ? '/profile' : '/login');
    }
  }, [user, initialized, router]);

  // Empty shell to prevent flicker while routing
  return <div className="min-h-screen bg-background" />;
}