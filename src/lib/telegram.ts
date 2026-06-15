
import { doc, getDoc, Firestore } from 'firebase/firestore';

/**
 * Sends a notification to the configured Telegram Admin chat.
 * Compatible with both Client and Server environments.
 */
export async function sendTelegramNotification(db: Firestore, message: string, inlineButtons?: any[]) {
  try {
    const settingsSnap = await getDoc(doc(db, 'settings', 'telegram'));
    if (!settingsSnap.exists()) return;

    const { botToken, adminChatId, notificationsEnabled } = settingsSnap.data();
    if (!notificationsEnabled || !botToken || !adminChatId) return;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const body: any = {
      chat_id: adminChatId,
      text: message,
      parse_mode: 'HTML',
    };

    if (inlineButtons) {
      body.reply_markup = {
        inline_keyboard: inlineButtons,
      };
    }

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error('Telegram notification error:', error);
  }
}
