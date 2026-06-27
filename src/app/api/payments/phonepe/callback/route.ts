
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { sendTelegramNotification } from '@/lib/telegram';
import { generatePhonePeHeader } from '@/lib/phonepe';

/**
 * HARDENED: Secure Callback Protocol for PhonePe
 * Now verifies provider signatures to prevent payment spoofing.
 */
export async function POST(req: NextRequest) {
  const { db } = initializeFirebase();
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const xVerify = req.headers.get('X-VERIFY');

  try {
    const formData = await req.formData();
    const response = formData.get('response') as string;
    
    // 1. Retrieve payment settings for signature verification
    const settingsSnap = await getDoc(doc(db, 'settings', 'payments'));
    if (!settingsSnap.exists()) {
      console.error('[Security Audit] Verification settings missing during callback.');
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    
    const { phonepeSaltKey, phonepeSaltIndex } = settingsSnap.data();

    // 2. Verify Signature
    const expectedHeader = generatePhonePeHeader(response, phonepeSaltKey, phonepeSaltIndex);
    if (xVerify !== expectedHeader) {
      console.error('[Security Audit] Payment Signature Mismatch! Attempted breach or spoof detected.');
      return NextResponse.json({ ok: false, error: 'Signature mismatch' }, { status: 401 });
    }

    const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString());
    const isSuccess = decodedResponse.code === 'PAYMENT_SUCCESS';

    console.log(`[Wallet Audit] Verified PhonePe Callback: type=${type}, id=${id}, status=${decodedResponse.code}`);

    if (type === 'order') {
      const orderRef = doc(db, 'orders', id!);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        const order = orderSnap.data();
        if (order.paymentStatus === 'success') {
          return NextResponse.json({ ok: true, message: 'Already processed' });
        }
        if (isSuccess) {
          // Update Order Status
          await updateDoc(orderRef, {
            status: 'processing',
            paymentStatus: 'success',
            transactionId: decodedResponse.data.merchantTransactionId,
            updatedAt: new Date().toISOString(),
          });

          // Update Lifetime Spend
          const userRef = doc(db, 'users', order.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const newSpend = (userData.lifetimeSpend || 0) + order.totalAmount;
            await updateDoc(userRef, {
              lifetimeSpend: newSpend,
              updatedAt: new Date().toISOString()
            });
          }

          sendTelegramNotification(db, `✅ <b>PAYMENT SUCCESS</b>\n\n📦 Order: ${id}\n💰 Amount: ₹${order.totalAmount}\n💳 Gateway: PhonePe`);
          return NextResponse.redirect(new URL(`/checkout/success/${id}`, req.url), 303);
        } else {
          await updateDoc(orderRef, { status: 'failed', paymentStatus: 'failed' });
          return NextResponse.redirect(new URL(`/orders`, req.url), 303);
        }
      }
    } else if (type === 'deposit') {
      const txRef = doc(db, 'transactions', id!);
      const txSnap = await getDoc(txRef);
      if (txSnap.exists()) {
        const tx = txSnap.data();
        if (tx.status === 'success') {
          return NextResponse.json({ ok: true, message: 'Already processed' });
        }
        if (isSuccess) {
          await updateDoc(txRef, { status: 'success' });
          const walletRef = doc(db, 'wallets', tx.userId);
          
          await updateDoc(walletRef, { 
            balance: increment(tx.amount), 
            updatedAt: new Date().toISOString() 
          });

          console.log(`[Wallet Audit] Verified Deposit applied: user=${tx.userId}, amount=+₹${tx.amount}`);
          sendTelegramNotification(db, `💰 <b>WALLET RECHARGE SUCCESS</b>\n\n👤 User ID: ${tx.userId}\n💵 Amount: ₹${tx.amount}\n💳 Method: PhonePe`);
          return NextResponse.redirect(new URL(`/wallet`, req.url), 303);
        } else {
          await updateDoc(txRef, { status: 'failed' });
          return NextResponse.redirect(new URL(`/wallet`, req.url), 303);
        }
      }
    }
    return NextResponse.redirect(new URL(`/`, req.url), 303);
  } catch (error: any) {
    console.error('[Wallet Audit] Callback Processing Exception:', error);
    return NextResponse.redirect(new URL(`/`, req.url), 303);
  }
}
