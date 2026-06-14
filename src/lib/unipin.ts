
import crypto from 'crypto';
import { Firestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendTelegramNotification } from './telegram';

export interface UniPinOrderRequest {
  apiKey: string;
  secretKey: string;
  orderId: string;
  productId: string;
  playerId: string;
  serverId: string;
}

/**
 * Generates HMAC-SHA256 signature for UniPin API
 */
function generateUniPinSignature(payload: string, secretKey: string) {
  return crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
}

/**
 * Executes a fulfilment request to UniPin
 */
export async function processUniPinOrder(db: Firestore, orderId: string) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    const settingsSnap = await getDoc(doc(db, 'settings', 'unipin'));

    if (!orderSnap.exists() || !settingsSnap.exists()) {
      throw new Error('Order or UniPin Settings missing');
    }

    const order = orderSnap.data();
    const settings = settingsSnap.data();

    if (!settings.isEnabled) {
      console.log('UniPin integration is disabled');
      return;
    }

    // Fetch Product Mapping
    const internalProductId = order.items?.[0]?.id?.split('-')[0];
    const mappingSnap = await getDoc(doc(db, 'productMappings', internalProductId));
    const unipinId = mappingSnap.exists() && mappingSnap.data().provider === 'unipin' ? mappingSnap.data().providerId : null;

    if (!unipinId) {
      throw new Error(`No UniPin mapping found for product: ${internalProductId}`);
    }

    // Prepare Payload
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
    const signature = generateUniPinSignature(payloadString, settings.secretKey);

    // Call UniPin API (Mocked for demonstration, would be a server-side fetch)
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
        unipinResponse: result,
        status: 'completed',
        updatedAt: new Date().toISOString(),
      });
      sendTelegramNotification(db, `✅ <b>UNIPIN SUCCESS</b>\n\n📦 Order: ${orderId}\n🎮 Product: ${order.items[0].name}\n👤 Player: ${order.playerInfo.playerId}`);
    } else {
      await updateDoc(orderRef, {
        unipinStatus: 'failed',
        unipinResponse: result,
      });
      sendTelegramNotification(db, `❌ <b>UNIPIN FAILED</b>\n\n📦 Order: ${orderId}\n⚠️ Error: ${result.message || 'Unknown UniPin Error'}`);
    }

  } catch (error: any) {
    console.error('UniPin Processing Error:', error);
    sendTelegramNotification(db, `⚠️ <b>UNIPIN EXCEPTION</b>\n\n📦 Order: ${orderId}\n🚨 Exception: ${error.message}`);
  }
}
