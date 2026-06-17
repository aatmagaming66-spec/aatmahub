'use client';

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, Query, FirestoreError } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * useCollection Hook
 * Optimized to prevent infinite render loops by stabilizing the Query reference
 * using Firestore's built-in isEqual() comparison.
 */
export function useCollection<T = any>(query: Query | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  // Use a ref to track the active query object for stable comparison
  const queryRef = useRef<Query | null>(query);
  const [activeQuery, setActiveQuery] = useState<Query | null>(query);

  // Stabilize the query dependency
  useEffect(() => {
    if (!query && !queryRef.current) return;
    
    const isSameQuery = query && queryRef.current && query.isEqual(queryRef.current);
    
    if (!isSameQuery) {
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
          // Attempt to extract path from internal query state if possible
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
