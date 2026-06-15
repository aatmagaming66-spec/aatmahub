'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { doc, onSnapshot } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function MaintenanceCheck() {
  const db = useFirestore();
  const { user, profile } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isReady || !user) return;

    const docRef = doc(db, 'settings', 'site');
    const unsub = onSnapshot(docRef, (snap) => {
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
    }, async (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'get'
        }));
      }
    });

    return () => unsub();
  }, [db, user, profile, router, pathname, isReady]);

  return null;
}