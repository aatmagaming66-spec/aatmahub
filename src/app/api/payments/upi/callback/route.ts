
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { sendTelegramNotification } from '@/lib/telegram';

/**
 * Secure Callback Protocol for UPI Gateway
 */
export async function POST(req: NextRequest) {
  const { db } = initializeFirebase();
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  try {
    const body = await req.formData();
    const status = body.get('status') as string;
    const clientTxnId = body.get('client_txn_id') as string;

    const isSuccess = status === 'success' || status === 'COMPLETED';

    console.log(`[Payment Audit] UPI Callback: type=${type}, id=${id}, status=${status}`);

    if (type === 'order') {
      const orderRef = doc(db, 'orders', id!);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        const order = orderSnap.data();
        if (order.paymentStatus === 'success') {
          return NextResponse.json({ ok: true });
        }

        if (isSuccess) {
          await updateDoc(orderRef, {
            status: 'processing',
            paymentStatus: 'success',
            updatedAt: new Date().toISOString(),
          });

          const userRef = doc(db, 'users', order.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            await updateDoc(userRef, {
              lifetimeSpend: increment(order.totalAmount),
              updatedAt: new Date().toISOString()
            });
          }

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
        if (tx.status === 'success') return NextResponse.json({ ok: true });

        if (isSuccess) {
          await updateDoc(txRef, { status: 'success' });
          await updateDoc(doc(db, 'wallets', tx.userId), { 
            balance: increment(tx.amount), 
            updatedAt: new Date().toISOString() 
          });
          return NextResponse.redirect(new URL(`/wallet`, req.url), 303);
        } else {
          await updateDoc(txRef, { status: 'failed' });
          return NextResponse.redirect(new URL(`/wallet`, req.url), 303);
        }
      }
    }
    return NextResponse.redirect(new URL(`/`, req.url), 303);
  } catch (error: any) {
    console.error('[Payment Audit] Callback Error:', error);
    return NextResponse.redirect(new URL(`/`, req.url), 303);
  }
}
