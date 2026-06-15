'use client';

import { Firestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type LogSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogData {
  userId?: string;
  event: string;
  details?: any;
  severity: LogSeverity;
}

/**
 * Record a security or system event in the Audit Logs.
 */
export function logEvent(db: Firestore, data: AuditLogData) {
  const logsRef = collection(db, 'auditLogs');
  const logData = {
    ...data,
    timestamp: new Date().toISOString(),
    serverTimestamp: serverTimestamp(),
  };

  addDoc(logsRef, logData)
    .catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: logsRef.path,
        operation: 'create',
        requestResourceData: logData
      }));
    });
}