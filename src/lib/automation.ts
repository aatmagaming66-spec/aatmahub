
'use client';

import { 
  Firestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  setDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { processSmileOneOrder } from './smileone';
import { processUniPinOrder } from './unipin';
import { sendTelegramNotification } from './telegram';

/**
 * Detects orders stuck in 'processing' for more than 10 minutes and attempts recovery.
 */
export async function detectStuckOrders(db: Firestore) {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const q = query(
    collection(db, 'orders'),
    where('status', '==', 'processing'),
    where('updatedAt', '<=', tenMinutesAgo)
  );

  const snap = await getDocs(q);
  for (const orderDoc of snap.docs) {
    const order = orderDoc.data();
    console.log(`[Automation] Stuck order detected: ${order.orderId}`);
    
    // Log recovery attempt
    await logAutomationEvent(db, {
      type: 'recovery',
      orderId: order.orderId,
      details: 'Processing status exceeded 10-minute threshold. Attempting provider sync.',
      status: 'triggered'
    });

    // Strategy: Re-trigger provider logic
    // Usually, the provider script handles if it was already successful
    const internalId = order.items?.[0]?.id?.split('-')[0];
    const mappingSnap = await getDocs(query(collection(db, 'productMappings'), where('__name__', '==', internalId)));
    
    if (!mappingSnap.empty) {
      const mapping = mappingSnap.docs[0].data();
      if (mapping.provider === 'smileone') {
        await processSmileOneOrder(db, order.orderId);
      } else if (mapping.provider === 'unipin') {
        await processUniPinOrder(db, order.orderId);
      }
    }
  }
}

/**
 * Automates failover from Smile.one to UniPin if Smile.one is failing consistently for an order.
 */
export async function triggerFailover(db: Firestore, orderId: string) {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, { failoverTriggered: true });

  await logAutomationEvent(db, {
    type: 'failover',
    orderId,
    details: 'Smile.one failed. Switching to UniPin failover.',
    status: 'success'
  });

  await sendTelegramNotification(db, `⚠️ <b>AUTOMATION: FAILOVER</b>\n\n📦 Order: ${orderId}\n🔄 Reason: Smile.one critical failure.\n🚀 Action: Routing to UniPin.`);
  
  // Attempt UniPin fulfillment
  await processUniPinOrder(db, orderId);
}

/**
 * Sends a daily revenue and order summary to Telegram.
 */
export async function sendDailyOperationalReport(db: Firestore) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  
  const q = query(
    collection(db, 'orders'),
    where('createdAt', '>=', startOfToday.toISOString())
  );

  const snap = await getDocs(q);
  const orders = snap.docs.map(d => d.data());
  
  const completed = orders.filter(o => o.status === 'completed');
  const revenue = completed.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const failed = orders.filter(o => o.status === 'failed').length;

  const report = `📊 <b>DAILY KERNEL REPORT</b>\n\n` +
    `💰 <b>Total Revenue:</b> ₹${revenue.toLocaleString()}\n` +
    `📦 <b>Orders Today:</b> ${orders.length}\n` +
    `✅ <b>Completed:</b> ${completed.length}\n` +
    `❌ <b>Failed:</b> ${failed}\n` +
    `⏰ <b>Generated:</b> ${new Date().toLocaleTimeString()}`;

  await sendTelegramNotification(db, report);
  
  await logAutomationEvent(db, {
    type: 'report',
    details: 'Daily operational summary dispatched to Telegram.',
    status: 'success'
  });
}

/**
 * Generic automation logger.
 */
async function logAutomationEvent(db: Firestore, data: any) {
  const logId = `AUTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  await setDoc(doc(db, 'automationLogs', logId), {
    ...data,
    logId,
    timestamp: new Date().toISOString(),
    serverTimestamp: serverTimestamp()
  });
}
