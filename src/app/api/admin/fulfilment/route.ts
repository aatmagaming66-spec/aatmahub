
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { processSmileOneOrder, processUniPinOrder } from '@/lib/fulfillment';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Secure API route for Admins to trigger fulfillment.
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

    const orderData = orderSnap.data();
    const internalId = orderData.items?.[0]?.id?.split('-')[0];
    const mappingSnap = await getDoc(doc(db, 'productMappings', internalId));

    if (mappingSnap.exists()) {
      const mapping = mappingSnap.data();
      if (mapping.provider === 'smileone') {
        await processSmileOneOrder(db, orderId);
      } else if (mapping.provider === 'unipin') {
        await processUniPinOrder(db, orderId);
      } else {
        await processSmileOneOrder(db, orderId);
      }
    } else {
      await processSmileOneOrder(db, orderId);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Fulfillment sequence dispatched successfully',
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
