'use client';

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, DocumentReference, FirestoreError } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * useDoc Hook
 * Optimized to prevent infinite render loops and ensure clean subscription cycles.
 */
export function useDoc<T = any>(docRef: DocumentReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Use the document path as a stable key to prevent re-subscribing 
  // if the docRef object is recreated by the parent component.
  const docPath = docRef?.path;

  useEffect(() => {
    let isMounted = true;

    if (!docRef) {
      setData(null);
      setLoading(false);
      setError(null);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (!isMounted) return;
        setData(snapshot.exists() ? (snapshot.data() as T) : null);
        setLoading(false);
        setError(null);
      },
      async (err) => {
        if (!isMounted) return;
        
        if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'get',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docPath]);

  return { data, loading, error };
}
