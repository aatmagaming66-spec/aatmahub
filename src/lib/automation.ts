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
  getDoc
} from 'firebase/firestore';
import { processSmileOneOrder } from './smileone';
import { processUniPinOrder } from './unipin';
import { sendTelegramNotification } from './telegram';

/**
 * Detects orders stuck in 'processing' for more than 10 minutes and attempts recovery.
 * (Server-side Only)
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
    
    await logAutomationEvent(db, {
      type: 'recovery',
      orderId: order.orderId,
      details: 'Processing status exceeded 10-minute threshold. Attempting provider sync.',
      status: 'triggered'
    });

    const internalId = order.items?.[0]?.id?.split('-')[0];
    const mappingSnap = await getDoc(doc(db, 'productMappings', internalId));
    
    if (mappingSnap.exists()) {
      const mapping = mappingSnap.data();
      if (mapping.provider === 'smileone') {
        await processSmileOneOrder(db, order.orderId);
      } else if (mapping.provider === 'unipin') {
        await processUniPinOrder(db, order.orderId);
      }
    }
  }
}

/**
 * Automates failover logic (Server-side Only)
 */
export async function triggerFailover(db: Firestore, orderId: string) {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, { 
    failoverTriggered: true,
    updatedAt: new Date().toISOString()
  });

  await logAutomationEvent(db, {
    type: 'failover',
    orderId,
    details: 'Smile.one retry limit reached. Switching to UniPin failover protocol.',
    status: 'success'
  });

  await sendTelegramNotification(db, `⚠️ <b>AUTOMATION: FAILOVER ENGAGED</b>\n\n📦 Order: ${orderId}\n🔄 Reason: Smile.one critical failure.\n🚀 Action: Re-routing to UniPin API.`);
  
  await processUniPinOrder(db, orderId);
}

/**
 * Sends revenue summary (Server-side Only)
 */
export async function sendDailyOperationalReport(db: Firestore) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  
  const q = query(
    collection(db, 'orders'),
    where('createdAt', '>=', startOfToday)
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

async function logAutomationEvent(db: Firestore, data: any) {
  const logId = `AUTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  await setDoc(doc(db, 'automationLogs', logId), {
    ...data,
    logId,
    timestamp: new Date().toISOString(),
    serverTimestamp: serverTimestamp()
  });
}
