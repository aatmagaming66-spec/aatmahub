
import crypto from 'crypto';
import { Firestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendTelegramNotification } from './telegram';

export interface SmileOneOrderRequest {
  uid: string;
  email: string;
  productid: string;
  playerid: string;
  serverid: string;
}

/**
 * Generates MD5 signature for Smile.one API
 */
function generateSmileOneSign(payload: SmileOneOrderRequest, secretKey: string) {
  const { uid, email, productid, playerid, serverid } = payload;
  const stringToSign = `${uid}${email}${productid}${playerid}${serverid}${secretKey}`;
  return crypto.createHash('md5').update(stringToSign).digest('hex');
}

/**
 * Executes a fulfilment request to Smile.one
 */
export async function processSmileOneOrder(db: Firestore, orderId: string) {
  try {
    // 1. Fetch Order and Settings
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    const settingsSnap = await getDoc(doc(db, 'settings', 'smileone'));

    if (!orderSnap.exists() || !settingsSnap.exists()) {
      throw new Error('Order or Settings missing');
    }

    const order = orderSnap.data();
    const settings = settingsSnap.data();

    if (!settings.isEnabled) {
      console.log('Smile.one integration is disabled');
      return;
    }

    // 2. Fetch Product Mapping
    // Note: We assume the first item in the order determines the Smile.one product mapping
    const internalProductId = order.items?.[0]?.id?.split('-')[0]; // e.g., 'mlbb'
    const mappingSnap = await getDoc(doc(db, 'productMappings', internalProductId));
    const smileOneId = mappingSnap.exists() ? mappingSnap.data().smileOneId : null;

    if (!smileOneId) {
      throw new Error(`No Smile.one mapping found for product: ${internalProductId}`);
    }

    // 3. Prepare Payload
    const payload: SmileOneOrderRequest = {
      uid: settings.apiUid,
      email: order.userId + '@aatma.com', // Placeholder email logic
      productid: smileOneId,
      playerid: order.playerInfo.playerId,
      serverid: order.playerInfo.serverId,
    };

    const sign = generateSmileOneSign(payload, settings.secretKey);

    // 4. API Call
    // NOTE: In a real environment, this should be done via a secure server action or proxy to avoid CORS
    const response = await fetch('https://api.smile.one/pg/v1/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, sign }),
    });

    const result = await response.json();

    // 5. Handle Response
    if (result.status === 200 || result.code === 200) {
      await updateDoc(orderRef, {
        smileOneStatus: 'success',
        smileOneResponse: result,
        status: 'completed',
        updatedAt: new Date().toISOString(),
      });
      sendTelegramNotification(db, `✅ <b>SMILE.ONE SUCCESS</b>\n\n📦 Order: ${orderId}\n🎮 Product: ${order.items[0].name}\n👤 Player: ${order.playerInfo.playerId}`);
    } else {
      await updateDoc(orderRef, {
        smileOneStatus: 'failed',
        smileOneResponse: result,
      });
      sendTelegramNotification(db, `❌ <b>SMILE.ONE FAILED</b>\n\n📦 Order: ${orderId}\n⚠️ Error: ${result.message || 'Unknown Error'}`);
    }

  } catch (error: any) {
    console.error('Smile.one Processing Error:', error);
    sendTelegramNotification(db, `⚠️ <b>SMILE.ONE EXCEPTION</b>\n\n📦 Order: ${orderId}\n🚨 Exception: ${error.message}`);
  }
}
