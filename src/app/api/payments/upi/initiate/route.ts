
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Secure API route to initiate UPI Gateway payments.
 */
export async function POST(req: NextRequest) {
  const { db } = initializeFirebase();
  
  try {
    const body = await req.json();
    const { amount, transactionId, userId, type, orderId, name, email } = body;

    if (!amount || !transactionId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing payment details' }, { status: 400 });
    }

    const settingsSnap = await getDoc(doc(db, 'settings', 'payments'));
    if (!settingsSnap.exists()) {
      return NextResponse.json({ success: false, error: 'Payment gateway not configured' }, { status: 500 });
    }
    
    const { upiKey, isUpiEnabled } = settingsSnap.data();

    if (!isUpiEnabled) {
      return NextResponse.json({ success: false, error: 'UPI Gateway is temporarily offline' }, { status: 503 });
    }

    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // Construct Payload for generic UPI Aggregator API
    // (Adaptive to most common UPI Gateway structures used in this niche)
    const payload = {
      key: upiKey,
      client_txn_id: transactionId,
      amount: amount.toString(),
      p_info: type === 'order' ? `Order ${orderId}` : 'Wallet Recharge',
      customer_name: name || 'Aatma User',
      customer_email: email || 'user@aatmahub.com',
      customer_mobile: '9999999999',
      redirect_url: `${baseUrl}/api/payments/upi/callback?type=${type}&id=${orderId || transactionId}`,
    };

    // Replace this with your specific UPI Gateway's endpoint
    // Standard endpoint for most aggregators: https://api.upigateway.com/v1/order/create
    const response = await fetch('https://api.upigateway.com/v1/order/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.status && data.data?.payment_url) {
      return NextResponse.json({ 
        success: true, 
        paymentUrl: data.data.payment_url,
        orderId: orderId || transactionId
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.msg || 'Gateway rejected initiation request' 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[UPI Audit] Initiation Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal system fault during payment sequence' 
    }, { status: 500 });
  }
}
