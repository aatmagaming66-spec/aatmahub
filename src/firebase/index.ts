'use client';

/**
 * Barrel file for Firebase functionality.
 * Note: Components should import from here. API routes should import from '@/firebase/init'.
 */
export { initializeFirebase } from './init';
export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-doc';
export * from './firestore/use-collection';
export * from './errors';
export * from './error-emitter';