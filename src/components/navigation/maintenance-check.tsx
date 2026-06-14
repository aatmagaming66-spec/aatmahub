
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { doc, onSnapshot } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';

export function MaintenanceCheck() {
  const db = useFirestore();
  const { profile } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'site'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
        
        // If maintenance is enabled and user is NOT admin
        if (data.maintenanceMode && !isAdmin && pathname !== '/maintenance') {
          router.push('/maintenance');
        } else if (!data.maintenanceMode && pathname === '/maintenance') {
          router.push('/');
        }
      }
    });

    return () => unsub();
  }, [db, profile, router, pathname]);

  return null;
}
