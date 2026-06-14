
'use client';

import { Firestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
export async function logEvent(db: Firestore, data: AuditLogData) {
  try {
    const logsRef = collection(db, 'auditLogs');
    await addDoc(logsRef, {
      ...data,
      timestamp: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
  } catch (error) {
    // Fail-silent logging to prevent crashing the main UI flow
    console.error('Audit Logging Error:', error);
  }
}
