import crypto from 'crypto';
import { Firestore, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { sendTelegramNotification } from './telegram';
import { processMooGoldOrder } from './moogold';

/**
 * TRIGGER FAILOVER
 * Automatically attempts backup provider fulfillment.
 */
export async function triggerFailover(db: Firestore, orderId: string) {
  console.log(`[Fulfillment] Triggering Failover for Order: ${orderId}`);
  
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, { 
    failoverTriggered: true,
    updatedAt: new Date().toISOString()
  });

  await sendTelegramNotification(db, `⚠️ <b>SYSTEM: FAILOVER ENGAGED</b>\n\n📦 Order: ${orderId}\n🔄 Reason: Primary provider failure.\n🚀 Action: Re-routing to Backup API.`);
  
  // Attempt UniPin as first failover, then MooGold
  return processUniPinOrder(db, orderId);
}

/**
 * SMILE.ONE FULFILLMENT
 */
export async function processSmileOneOrder(db: Firestore, orderId: string) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    const settingsSnap = await getDoc(doc(db, 'settings', 'smileone'));

    if (!orderSnap.exists() || !settingsSnap.exists()) return;

    const order = orderSnap.data();
    const settings = settingsSnap.data();

    if (!settings.isEnabled) return;

    if ((order.retryCount || 0) >= 3) {
      return triggerFailover(db, orderId);
    }

    const internalProductId = order.items?.[0]?.id?.split('-')[0];
    const mappingSnap = await getDoc(doc(db, 'productMappings', internalProductId));
    const smileOneId = mappingSnap.exists() ? mappingSnap.data().smileOneId : null;

    if (!smileOneId) return;

    const payload = {
      uid: settings.apiUid,
      email: order.userId + '@aatma.com',
      productid: smileOneId,
      playerid: order.playerInfo.playerId,
      serverid: order.playerInfo.serverId,
    };

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
      sendTelegramNotification(db, `✅ <b>FULFILLMENT SUCCESS</b>\n\n📦 Order: ${orderId}\n🎮 Item: ${order.items[0].name}\n👤 Player: ${order.playerInfo.playerId}`);
    } else {
      await updateDoc(orderRef, {
        smileOneStatus: 'failed',
        retryCount: increment(1),
        updatedAt: new Date().toISOString(),
      });
      
      if ((order.retryCount || 0) + 1 >= 3) {
        return triggerFailover(db, orderId);
      }
    }
  } catch (error: any) {
    console.error('Fulfillment Error:', error);
  }
}

/**
 * UNIPIN FULFILLMENT
 */
export async function processUniPinOrder(db: Firestore, orderId: string) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    const settingsSnap = await getDoc(doc(db, 'settings', 'unipin'));

    if (!orderSnap.exists() || !settingsSnap.exists()) return;

    const order = orderSnap.data();
    const settings = settingsSnap.data();

    if (!settings.isEnabled) return;

    const internalProductId = order.items?.[0]?.id?.split('-')[0];
    const mappingSnap = await getDoc(doc(db, 'productMappings', internalProductId));
    const unipinId = mappingSnap.exists() ? mappingSnap.data().providerId : null;

    if (!unipinId) return;

    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
      api_key: settings.apiKey,
      timestamp: timestamp,
      order_id: orderId,
      product_id: unipinId,
      player_id: order.playerInfo.playerId,
      server_id: order.playerInfo.serverId,
    };

    const payloadString = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', settings.secretKey).update(payloadString).digest('hex');

    const response = await fetch('https://api.unipin.com/v1/direct/topup', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-UniPin-Signature': signature
      },
      body: payloadString,
    });

    const result = await response.json();

    if (result.status === 'success' || result.code === 200) {
      await updateDoc(orderRef, {
        unipinStatus: 'success',
        status: 'completed',
        updatedAt: new Date().toISOString(),
      });
      sendTelegramNotification(db, `✅ <b>FULFILLMENT SUCCESS (UniPin)</b>\n\n📦 Order: ${orderId}\n👤 Player: ${order.playerInfo.playerId}`);
    } else {
      // If UniPin fails, try MooGold
      return processMooGoldOrder(db, orderId);
    }
  } catch (error: any) {
    console.error('UniPin Error:', error);
  }
}
