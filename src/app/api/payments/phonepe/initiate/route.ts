import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { doc, getDoc } from 'firebase/firestore';
import { generatePhonePeHeader, PHONEPE_ENDPOINTS } from '@/lib/phonepe';

/**
 * Secure API route to initiate PhonePe payments.
 * Audited for credential validation and verbose failure logging.
 */
export async function POST(req: NextRequest) {
  const { db } = initializeFirebase();
  
  try {
    const body = await req.json();
    const { amount, transactionId, userId, type, orderId } = body;

    console.log('[PhonePe Audit] Initiation Request received:', { amount, transactionId, userId, type, orderId });

    if (!amount || !transactionId || !userId) {
      console.error('[PhonePe Audit] Critical failure: Missing mandatory fields in request.');
      return NextResponse.json({ 
        success: false, 
        error: 'Missing mandatory payment details' 
      }, { status: 400 });
    }

    const settingsSnap = await getDoc(doc(db, 'settings', 'payments'));
    if (!settingsSnap.exists()) {
      console.error('[PhonePe Audit] Database failure: /settings/payments not found.');
      return NextResponse.json({ 
        success: false, 
        error: 'PhonePe credentials not configured' 
      }, { status: 500 });
    }
    
    const settings = settingsSnap.data();
    const { phonepeMerchantId, phonepeSaltKey, phonepeSaltIndex, phonepeEnv, isPhonePeEnabled } = settings;

    // 1. Verify credentials exist
    if (!phonepeMerchantId || !phonepeSaltKey || !phonepeSaltIndex) {
      console.error('[PhonePe Audit] Configuration failure: Missing Merchant ID, Salt Key, or Salt Index.');
      return NextResponse.json({ 
        success: false, 
        error: 'PhonePe credentials not configured' 
      }, { status: 500 });
    }

    if (!isPhonePeEnabled) {
      console.warn('[PhonePe Audit] Gatekeeper: PhonePe is explicitly disabled in settings.');
      return NextResponse.json({ 
        success: false, 
        error: 'PhonePe gateway is temporarily offline' 
      }, { status: 503 });
    }

    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // 2. Construct Payload
    const payload = {
      merchantId: phonepeMerchantId,
      merchantTransactionId: transactionId,
      merchantUserId: userId,
      amount: Math.round(amount * 100), // conversion to paise
      redirectUrl: `${baseUrl}/api/payments/phonepe/callback?type=${type}&id=${orderId || transactionId}`,
      redirectMode: 'POST',
      callbackUrl: `${baseUrl}/api/payments/phonepe/callback?type=${type}&id=${orderId || transactionId}`,
      mobileNumber: '9999999999',
      paymentInstrument: { type: 'PAY_PAGE' },
    };

    console.log('[PhonePe Audit] Payload generated:', payload);

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const xVerifyHeader = generatePhonePeHeader(base64Payload, phonepeSaltKey, phonepeSaltIndex);
    const endpoint = phonepeEnv === 'production' ? PHONEPE_ENDPOINTS.production : PHONEPE_ENDPOINTS.sandbox;
    
    console.log('[PhonePe Audit] Transmitting request to:', endpoint);

    // 3. API Execution
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerifyHeader,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const status = response.status;
    const text = await response.text();
    console.log('[PhonePe Audit] Remote API Response Status:', status);
    
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('[PhonePe Audit] Parse failure: Remote response was not valid JSON.', text);
      return NextResponse.json({ success: false, error: 'Provider returned malformed response' }, { status: 502 });
    }

    if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
      console.log('[PhonePe Audit] Initiation Success. Redirecting user.');
      return NextResponse.json({ 
        success: true, 
        paymentUrl: data.data.instrumentResponse.redirectInfo.url,
        orderId: orderId || transactionId
      });
    } else {
      console.error('[PhonePe Audit] Provider rejection:', data);
      return NextResponse.json({ 
        success: false, 
        error: data.message || 'Payment initiation rejected by provider.',
        details: data
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[PhonePe Audit] Internal System Exception:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal failure during payment sequence.' 
    }, { status: 500 });
  }
}
