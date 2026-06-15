import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  const { db } = initializeFirebase();
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  try {
    const formData = await req.formData();
    const response = formData.get('response') as string;
    const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString());
    const isSuccess = decodedResponse.code === 'PAYMENT_SUCCESS';

    if (type === 'order') {
      const orderRef = doc(db, 'orders', id!);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        const order = orderSnap.data();
        if (order.paymentStatus === 'success') {
          return NextResponse.json({ ok: true, message: 'Already processed' });
        }
        if (isSuccess) {
          await updateDoc(orderRef, {
            status: 'processing',
            paymentStatus: 'success',
            transactionId: decodedResponse.data.merchantTransactionId,
            updatedAt: new Date().toISOString(),
          });
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
          const walletSnap = await getDoc(walletRef);
          const currentBal = walletSnap.exists() ? walletSnap.data().balance : 0;
          await setDoc(walletRef, { 
            balance: currentBal + tx.amount, 
            updatedAt: new Date().toISOString() 
          }, { merge: true });
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
    console.error('PhonePe Callback Error:', error);
    return NextResponse.redirect(new URL(`/`, req.url), 303);
  }
}