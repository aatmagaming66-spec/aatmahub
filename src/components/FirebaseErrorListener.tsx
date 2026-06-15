'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error) => {
      // In development, Next.js will pick this up as an uncaught exception
      // and show the error overlay with the contextual info.
      if (process.env.NODE_ENV === 'development') {
        throw error;
      } else {
        console.error(error);
      }
    });
    return () => unsubscribe();
  }, []);

  return null;
}