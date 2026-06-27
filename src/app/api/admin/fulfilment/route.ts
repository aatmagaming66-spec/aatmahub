import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { processSmileOneOrder } from '@/lib/fulfillment';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Secure API route for Admins to trigger fulfillment.
 * Strictly limited to Smile.one integration.
 */
export async function POST(req: NextRequest) {
  const { db } = initializeFirebase();
  
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      return NextResponse.json({ success: false, error: 'Order document not found' }, { status: 404 });
    }

    // Trigger the Smile.one sequence immediately
    await processSmileOneOrder(db, orderId);

    return NextResponse.json({ 
      success: true, 
      message: 'Smile.one fulfillment sequence dispatched',
      orderId 
    });
  } catch (error: any) {
    console.error('[API] Fulfillment dispatcher error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal failure during fulfillment dispatch.' 
    }, { status: 500 });
  }
}
