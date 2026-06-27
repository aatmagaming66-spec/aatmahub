
import { Firestore } from 'firebase/firestore';

/**
 * DECOMMISSIONED: Telegram notification system has been fully removed.
 * This function is now a no-op to prevent breaking existing code references.
 */
export async function sendTelegramNotification(db: Firestore, message: string, inlineButtons?: any[]) {
  // Integration removed by administrative request.
  return Promise.resolve();
}
