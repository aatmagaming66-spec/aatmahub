'use client';

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, Query, FirestoreError, queryEqual } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * useCollection Hook
 * Optimized to prevent infinite render loops by stabilizing the Query reference
 * using Firestore's built-in queryEqual() utility.
 */
export function useCollection<T = any>(query: Query | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  // Track the current "active" query to determine when to re-subscribe
  const [activeQuery, setActiveQuery] = useState<Query | null>(null);
  const queryRef = useRef<Query | null>(null);

  // Deep compare the incoming query to stabilize it
  useEffect(() => {
    if (!query) {
      if (queryRef.current !== null) {
        queryRef.current = null;
        setActiveQuery(null);
      }
      return;
    }

    const isSame = queryRef.current && queryEqual(query, queryRef.current);
    
    if (!isSame) {
      queryRef.current = query;
      setActiveQuery(query);
    }
  }, [query]);

  useEffect(() => {
    let isMounted = true;

    if (!activeQuery) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      activeQuery,
      (snapshot) => {
        if (!isMounted) return;
        
        const results = snapshot.docs.map((doc) => ({
          ...doc.data(),
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
          // Attempt to extract path from internal query state for rich error context
          const queryPath = (activeQuery as any)._query?.path?.toString() || 'collection';
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: queryPath,
            operation: 'list',
          }));
        }
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [activeQuery]);

  return { data, loading, error };
}
