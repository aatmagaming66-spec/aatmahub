import crypto from 'crypto';
import { Firestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendTelegramNotification } from './telegram';

export interface MooGoldOrderRequest {
  partnerId: string;
  secretKey: string;
  orderId: string;
  productId: string;
  playerId: string;
  serverId?: string;
}

/**
 * Executes a fulfillment request to MooGold API.
 */
export async function processMooGoldOrder(db: Firestore, orderId: string) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    const settingsSnap = await getDoc(doc(db, 'settings', 'moogold'));

    if (!orderSnap.exists() || !settingsSnap.exists()) {
      throw new Error('Order or MooGold Settings missing');
    }

    const order = orderSnap.data();
    const settings = settingsSnap.data();

    if (!settings.isEnabled) return;

    // Fetch Product Mapping
    const internalProductId = order.items?.[0]?.id?.split('-')[0];
    const mappingSnap = await getDoc(doc(db, 'productMappings', internalProductId));
    const moogoldId = mappingSnap.exists() ? mappingSnap.data().moogoldId : null;

    if (!moogoldId) throw new Error(`No MooGold mapping found for product: ${internalProductId}`);

    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
      path: 'direct/topup',
      partner_id: settings.partnerId,
      timestamp: timestamp,
      order_id: orderId,
      product_id: moogoldId,
      player_id: order.playerInfo.playerId,
      server_id: order.playerInfo.serverId || '',
    };

    const signature = crypto
      .createHmac('sha256', settings.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    const response = await fetch('https://api.moogold.com/v1/direct/topup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signature}`,
        'X-Partner-ID': settings.partnerId
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.status === 'success' || result.code === 200) {
      await updateDoc(orderRef, {
        moogoldStatus: 'success',
        status: 'completed',
        updatedAt: new Date().toISOString(),
      });
      sendTelegramNotification(db, `✅ <b>MOOGOLD SUCCESS</b>\n\n📦 Order: ${orderId}\n🎮 Product: ${order.items[0].name}\n👤 Player: ${order.playerInfo.playerId}`);
    } else {
      await updateDoc(orderRef, { moogoldStatus: 'failed' });
      sendTelegramNotification(db, `❌ <b>MOOGOLD FAILED</b>\n\n📦 Order: ${orderId}\n⚠️ Error: ${result.message || 'Unknown MooGold Error'}`);
    }

  } catch (error: any) {
    console.error('MooGold Processing Error:', error);
    sendTelegramNotification(db, `⚠️ <b>MOOGOLD EXCEPTION</b>\n\n📦 Order: ${orderId}\n🚨 Exception: ${error.message}`);
  }
}
