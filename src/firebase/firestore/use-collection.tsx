'use client';

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, Query, FirestoreError } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * useCollection Hook
 * Optimized to preserve the actual Firestore Document ID in 'firestoreId'
 * to prevent collisions with document data properties.
 */
export function useCollection<T = any>(query: Query | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!query) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        if (!isMounted) return;
        
        const results = snapshot.docs.map((doc) => ({
          ...doc.data(),
          // Always set ID fields last to ensure they reflect the Firestore Document ID
          id: doc.id,
          firestoreId: doc.id,
        })) as T[];
        
        setData(results);
        setLoading(false);
        setError(null);
      },
      async (err) => {
        if (!isMounted) return;
        if (err.code === 'permission-denied') {
          const queryPath = (query as any)._query?.path?.toString() || 'unknown';
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: queryPath,
            operation: 'list',
          }));
        }
        setError(err);
        setLoading(false);
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      isMounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [query]);

  return { data, loading, error };
}
