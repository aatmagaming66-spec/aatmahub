
'use client';

import { Firestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type LogSeverity = 'info' | 'warning' | 'critical' | 'security_breach';

export interface AuditLogData {
  userId?: string;
  event: string;
  category: 'authentication' | 'financial' | 'administration' | 'system';
  details?: any;
  severity: LogSeverity;
  ipAddress?: string; // Optional metadata for tracking
}

/**
 * Record a security or system event in the Audit Logs.
 * HARDENED: Enhanced metadata and severity categorization.
 */
export async function logEvent(db: Firestore, data: AuditLogData) {
  const logsRef = collection(db, 'auditLogs');
  const logData = {
    ...data,
    timestamp: new Date().toISOString(),
    serverTimestamp: serverTimestamp(),
    environment: process.env.NODE_ENV
  };

  try {
    await addDoc(logsRef, logData);
  } catch (error) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: logsRef.path,
      operation: 'create',
      requestResourceData: logData
    }));
  }
}
