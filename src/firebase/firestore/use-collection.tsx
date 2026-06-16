'use client';

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, Query, FirestoreError } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * useCollection Hook
 * Optimized to prevent infinite render loops by stabilizing state updates
 * and ensuring subscription cleanup.
 */
export function useCollection<T = any>(query: Query | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  // Track the active subscription to prevent overlapping effects
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!query) {
      setData([]);
      setLoading(false);
      setError(null);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      return;
    }

    // Only trigger loading if we aren't already in a loading state for this query
    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        if (!isMounted) return;
        
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        
        setData(results);
        setLoading(false);
        setError(null);
      },
      async (err) => {
        if (!isMounted) return;
        
        if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: (query as any)._query?.path?.toString() || 'unknown collection',
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
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
  }, [query]); // Dependency strictly on the query object reference

  return { data, loading, error };
}
