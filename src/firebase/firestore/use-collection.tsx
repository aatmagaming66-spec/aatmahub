'use client';

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, Query, FirestoreError } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

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

    const startTime = performance.now();
    const queryPath = (query as any)._query?.path?.toString() || 'unknown';
    console.log(`[PERF] Firestore Query Started: ${queryPath}`);

    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        if (!isMounted) return;
        
        const fetchTime = performance.now() - startTime;
        console.log(`[PERF] Query Result: ${queryPath} returned ${snapshot.docs.length} docs in ${fetchTime.toFixed(2)}ms`);
        
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
