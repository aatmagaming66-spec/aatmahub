
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  const { db } = initializeFirebase();
  const body = await req.json();

  // Basic security: Fetch settings to verify Bot Token and Admin Chat ID
  const settingsSnap = await getDoc(doc(db, 'settings', 'telegram'));
  if (!settingsSnap.exists()) {
    return NextResponse.json({ ok: false, error: 'No settings' });
  }
  const { botToken, adminChatId, controlsEnabled } = settingsSnap.data();

  if (!controlsEnabled) {
    return NextResponse.json({ ok: true, message: 'Controls disabled' });
  }

  // Handle Callback Query (Buttons)
  if (body.callback_query) {
    const callback = body.callback_query;
    const data = callback.data; // Format: "action:id"
    const [action, id] = data.split(':');

    try {
      if (action === 'approve_order' || action === 'process_order' || action === 'complete_order' || action === 'cancel_order') {
        let status = 'pending';
        if (action === 'process_order') status = 'processing';
        if (action === 'complete_order') status = 'completed';
        if (action === 'cancel_order') status = 'cancelled';

        await updateDoc(doc(db, 'orders', id), { status });
        
        // Notify Telegram of Success
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: callback.id, text: `Order ${id} marked as ${status}` }),
        });
      }

      if (action === 'approve_deposit') {
        const txSnap = await getDoc(doc(db, 'transactions', id));
        if (txSnap.exists() && txSnap.data().status === 'pending') {
          const tx = txSnap.data();
          await updateDoc(doc(db, 'transactions', id), { status: 'success' });
          
          const walletRef = doc(db, 'wallets', tx.userId);
          const walletSnap = await getDoc(walletRef);
          const currentBal = walletSnap.exists() ? walletSnap.data().balance : 0;
          await setDoc(walletRef, { balance: currentBal + tx.amount, updatedAt: new Date().toISOString() }, { merge: true });
          
          await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: callback.id, text: `Deposit Approved: ₹${tx.amount}` }),
          });
        }
      }
    } catch (e) {
      console.error('Webhook processing error:', e);
    }
  }

  return NextResponse.json({ ok: true });
}
