'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';

/**
 * Invisible Redirector
 * This page is now a silent fallback for any legacy links to /account.
 * Navigation components now resolve directly to /profile or /login.
 */
export default function AccountRedirect() {
  const { user, initialized } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (initialized) {
      router.replace(user ? '/profile' : '/login');
    }
  }, [user, initialized, router]);

  // Clean shell that matches app layout to prevent visual flash
  return <div className="min-h-screen bg-background" />;
}
