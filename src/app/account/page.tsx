'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';

/**
 * Account Utility Redirector
 * Refactored to render a silent shell while executing redirect logic.
 * This prevents the "Hard Spinner" flicker during navigation.
 */
export default function AccountRedirect() {
  const { user, initialized } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (initialized) {
      if (user) {
        router.push('/profile');
      } else {
        router.push('/login');
      }
    }
  }, [user, initialized, router]);

  // Render a minimal empty shell that matches the app layout
  // to prevent a "flash of white" or blocking spinner.
  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="relative flex flex-col items-center gap-4">
         <div className="h-10 w-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );
}
