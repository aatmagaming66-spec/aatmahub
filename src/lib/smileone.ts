
'use client';

import crypto from 'crypto';
import { Firestore, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { sendTelegramNotification } from './telegram';
import { triggerFailover } from './automation';

export interface SmileOneOrderRequest {
  uid: string;
  email: string;
  productid: string;
  playerid: string;
  serverid: string;
}

function generateSmileOneSign(payload: SmileOneOrderRequest, secretKey: string) {
  const { uid, email, productid, playerid, serverid } = payload;
  const stringToSign = `${uid}${email}${productid}${playerid}${serverid}${secretKey}`;
  return crypto.createHash('md5').update(stringToSign).digest('hex');
}

export async function processSmileOneOrder(db: Firestore, orderId: string) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    const settingsSnap = await getDoc(doc(db, 'settings', 'smileone'));

    if (!orderSnap.exists() || !settingsSnap.exists()) throw new Error('Order or Settings missing');

    const order = orderSnap.data();
    const settings = settingsSnap.data();

    if (!settings.isEnabled) return;

    // Retry limit check
    if ((order.retryCount || 0) >= 3) {
      await triggerFailover(db, orderId);
      return;
    }

    const internalProductId = order.items?.[0]?.id?.split('-')[0];
    const mappingSnap = await getDoc(doc(db, 'productMappings', internalProductId));
    const smileOneId = mappingSnap.exists() ? mappingSnap.data().smileOneId : null;

    if (!smileOneId) throw new Error(`No Smile.one mapping found for product: ${internalProductId}`);

    const payload: SmileOneOrderRequest = {
      uid: settings.apiUid,
      email: order.userId + '@aatma.com',
      productid: smileOneId,
      playerid: order.playerInfo.playerId,
      serverid: order.playerInfo.serverId,
    };

    const sign = generateSmileOneSign(payload, settings.secretKey);

    const response = await fetch('https://api.smile.one/pg/v1/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, sign }),
    });

    const result = await response.json();

    if (result.status === 200 || result.code === 200) {
      await updateDoc(orderRef, {
        smileOneStatus: 'success',
        smileOneResponse: result,
        status: 'completed',
        updatedAt: new Date().toISOString(),
      });
      sendTelegramNotification(db, `✅ <b>SMILE.ONE SUCCESS</b>\n\n📦 Order: ${orderId}\n🎮 Product: ${order.items[0].name}\n👤 Player: ${order.playerInfo.playerId}`);
    } else {
      // Increment retry count on failure
      const currentRetry = (order.retryCount || 0) + 1;
      await updateDoc(orderRef, {
        smileOneStatus: 'failed',
        smileOneResponse: result,
        retryCount: increment(1),
        updatedAt: new Date().toISOString(),
      });
      
      if (currentRetry >= 3) {
        await triggerFailover(db, orderId);
      }
    }

  } catch (error: any) {
    console.error('Smile.one Processing Error:', error);
    sendTelegramNotification(db, `⚠️ <b>SMILE.ONE EXCEPTION</b>\n\n📦 Order: ${orderId}\n🚨 Exception: ${error.message}`);
  }
}
