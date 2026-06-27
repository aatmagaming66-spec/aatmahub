import crypto from 'crypto';
import { Firestore, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { sendTelegramNotification } from './telegram';

/**
 * SMILE.ONE EXCLUSIVE FULFILLMENT
 * Processes digital asset delivery through the Smile.one API.
 */
export async function processSmileOneOrder(db: Firestore, orderId: string) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    const settingsSnap = await getDoc(doc(db, 'settings', 'smileone'));

    if (!orderSnap.exists() || !settingsSnap.exists()) {
      console.error('[Fulfillment] Missing order or Smile.one configuration.');
      return;
    }

    const order = orderSnap.data();
    const settings = settingsSnap.data();

    if (!settings.isEnabled) {
      console.warn('[Fulfillment] Smile.one is currently disabled in settings.');
      return;
    }

    // Identify Product Mapping
    const internalProductId = order.items?.[0]?.id?.split('-')[0];
    const mappingSnap = await getDoc(doc(db, 'productMappings', internalProductId));
    const smileOneId = mappingSnap.exists() ? mappingSnap.data().smileOneId : null;

    if (!smileOneId) {
      console.error(`[Fulfillment] No Smile.one ID mapping found for product: ${internalProductId}`);
      return;
    }

    // Construct Payload
    const payload = {
      uid: settings.apiUid,
      email: order.userId + '@aatma.com',
      productid: smileOneId,
      playerid: order.playerInfo.playerId,
      serverid: order.playerInfo.serverId,
    };

    // Security Signature (MD5)
    const stringToSign = `${payload.uid}${payload.email}${payload.productid}${payload.playerid}${payload.serverid}${settings.secretKey}`;
    const sign = crypto.createHash('md5').update(stringToSign).digest('hex');

    const response = await fetch('https://api.smile.one/pg/v1/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, sign }),
    });

    const result = await response.json();

    if (result.status === 200 || result.code === 200) {
      await updateDoc(orderRef, {
        smileOneStatus: 'success',
        status: 'completed',
        updatedAt: new Date().toISOString(),
      });
      console.log(`[Fulfillment] Success: Order ${orderId} delivered.`);
    } else {
      await updateDoc(orderRef, {
        smileOneStatus: 'failed',
        smileOneError: result.message || 'Unknown Error',
        retryCount: increment(1),
        updatedAt: new Date().toISOString(),
      });
      console.error(`[Fulfillment] Rejected by Smile.one: ${result.message}`);
    }
  } catch (error: any) {
    console.error('[Fulfillment] System Exception:', error);
  }
}
