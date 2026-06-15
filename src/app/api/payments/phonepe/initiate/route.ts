import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { doc, getDoc } from 'firebase/firestore';
import { generatePhonePeHeader, PHONEPE_ENDPOINTS } from '@/lib/phonepe';

/**
 * Secure API route to initiate PhonePe payments.
 * Ensures valid JSON responses for all success and error paths.
 */
export async function POST(req: NextRequest) {
  const { db } = initializeFirebase();
  
  try {
    const body = await req.json();
    const { amount, transactionId, userId, type, orderId } = body;

    if (!amount || !transactionId || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing mandatory payment details' 
      }, { status: 400 });
    }

    const settingsSnap = await getDoc(doc(db, 'settings', 'payments'));
    if (!settingsSnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment gateway configuration not found' 
      }, { status: 500 });
    }
    
    const settings = settingsSnap.data();
    if (!settings.isPhonePeEnabled) {
      return NextResponse.json({ 
        success: false, 
        error: 'PhonePe gateway is temporarily offline' 
      }, { status: 503 });
    }

    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    const payload = {
      merchantId: settings.phonepeMerchantId,
      merchantTransactionId: transactionId,
      merchantUserId: userId,
      amount: Math.round(amount * 100), // convert to paise
      redirectUrl: `${baseUrl}/api/payments/phonepe/callback?type=${type}&id=${orderId || transactionId}`,
      redirectMode: 'POST',
      callbackUrl: `${baseUrl}/api/payments/phonepe/callback?type=${type}&id=${orderId || transactionId}`,
      mobileNumber: '9999999999',
      paymentInstrument: { type: 'PAY_PAGE' },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const xVerifyHeader = generatePhonePeHeader(base64Payload, settings.phonepeSaltKey, settings.phonepeSaltIndex);
    const endpoint = settings.phonepeEnv === 'production' ? PHONEPE_ENDPOINTS.production : PHONEPE_ENDPOINTS.sandbox;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerifyHeader,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
      return NextResponse.json({ 
        success: true, 
        paymentUrl: data.data.instrumentResponse.redirectInfo.url,
        orderId: orderId || transactionId
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.message || 'Payment initiation rejected by provider.' 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[API] PhonePe Initiation Critical Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal logic breach occurred.' 
    }, { status: 500 });
  }
}
