
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { generatePhonePeHeader, PHONEPE_ENDPOINTS } from '@/lib/phonepe';

/**
 * Initiates a PhonePe payment and returns the redirect URL.
 */
export async function POST(req: NextRequest) {
  const { db } = initializeFirebase();
  const body = await req.json();
  const { amount, transactionId, userId, type, orderId } = body;

  try {
    // 1. Fetch Payment Settings
    const settingsSnap = await getDoc(doc(db, 'settings', 'payments'));
    if (!settingsSnap.exists()) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }
    const settings = settingsSnap.data();

    if (!settings.isPhonePeEnabled) {
      return NextResponse.json({ error: 'PhonePe is currently disabled' }, { status: 500 });
    }

    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // 2. Prepare Payload
    const payload = {
      merchantId: settings.phonepeMerchantId,
      merchantTransactionId: transactionId,
      merchantUserId: userId,
      amount: amount * 100, // Amount in paise
      redirectUrl: `${baseUrl}/api/payments/phonepe/callback?type=${type}&id=${orderId || transactionId}`,
      redirectMode: 'POST',
      callbackUrl: `${baseUrl}/api/payments/phonepe/callback?type=${type}&id=${orderId || transactionId}`,
      mobileNumber: '9999999999', // Placeholder or fetch from user profile
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const xVerifyHeader = generatePhonePeHeader(base64Payload, settings.phonepeSaltKey, settings.phonepeSaltIndex);

    // 3. Call PhonePe API
    const endpoint = settings.phonepeEnv === 'production' ? PHONEPE_ENDPOINTS.production : PHONEPE_ENDPOINTS.sandbox;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerifyHeader,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = await response.json();

    if (data.success && data.data.instrumentResponse.redirectInfo.url) {
      return NextResponse.json({ url: data.data.instrumentResponse.redirectInfo.url });
    } else {
      console.error('PhonePe error:', data);
      return NextResponse.json({ error: data.message || 'Payment initiation failed' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Initiation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
