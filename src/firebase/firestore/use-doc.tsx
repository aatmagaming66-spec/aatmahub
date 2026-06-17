'use client';

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, DocumentReference, FirestoreError, refEqual } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * useDoc Hook
 * Optimized to prevent infinite render loops and ensure clean subscription cycles
 * by stabilizing the DocumentReference using refEqual().
 */
export function useDoc<T = any>(docRef: DocumentReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  const [activeRef, setActiveRef] = useState<DocumentReference | null>(null);
  const refTracker = useRef<DocumentReference | null>(null);

  // Stabilize the reference identity
  useEffect(() => {
    if (!docRef) {
      if (refTracker.current !== null) {
        refTracker.current = null;
        setActiveRef(null);
      }
      return;
    }

    const isSame = refTracker.current && refEqual(docRef, refTracker.current);

    if (!isSame) {
      refTracker.current = docRef;
      setActiveRef(docRef);
    }
  }, [docRef]);

  useEffect(() => {
    let isMounted = true;

    if (!activeRef) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      activeRef,
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
            path: activeRef.path,
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
        
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [activeRef]);

  return { data, loading, error };
}
