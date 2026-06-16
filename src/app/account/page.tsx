'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';

export default function AccountRedirect() {
  const { user, loading, initialized } = useUser();
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

  // Utility page - Render an empty animated shell to minimize flicker
  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="relative flex flex-col items-center gap-4">
         <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
         <div className="animate-pulse text-[10px] text-primary font-black uppercase tracking-[0.4em]">Hub Synchronization</div>
      </div>
    </div>
  );
}
