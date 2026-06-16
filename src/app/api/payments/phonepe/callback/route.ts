
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { sendTelegramNotification } from '@/lib/telegram';
import { getRankFromSpend, DEFAULT_RANKS } from '@/lib/ranks';

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

    console.log(`[Wallet Audit] PhonePe Callback: type=${type}, id=${id}, status=${decodedResponse.code}`);

    if (type === 'order') {
      const orderRef = doc(db, 'orders', id!);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        const order = orderSnap.data();
        if (order.paymentStatus === 'success') {
          return NextResponse.json({ ok: true, message: 'Already processed' });
        }
        if (isSuccess) {
          // 1. Update Order Status
          await updateDoc(orderRef, {
            status: 'processing',
            paymentStatus: 'success',
            transactionId: decodedResponse.data.merchantTransactionId,
            updatedAt: new Date().toISOString(),
          });

          // 2. Update User Membership Persistence
          const userRef = doc(db, 'users', order.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const newSpend = (userData.lifetimeSpend || 0) + order.totalAmount;
            const newRank = getRankFromSpend(newSpend, DEFAULT_RANKS);
            
            await updateDoc(userRef, {
              lifetimeSpend: newSpend,
              currentRank: newRank.name,
              rankId: newRank.id,
              updatedAt: new Date().toISOString()
            });
            console.log(`[Membership Audit] Rank Sync: user=${order.userId}, spend=${newSpend}, rank=${newRank.name}`);
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
          
          // AUDIT: Use increment() for server-side balance accuracy
          await updateDoc(walletRef, { 
            balance: increment(tx.amount), 
            updatedAt: new Date().toISOString() 
          });

          console.log(`[Wallet Audit] Deposit Credit applied: user=${tx.userId}, amount=+₹${tx.amount}`);
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
    console.error('[Wallet Audit] PhonePe Callback Exception:', error);
    return NextResponse.redirect(new URL(`/`, req.url), 303);
  }
}
