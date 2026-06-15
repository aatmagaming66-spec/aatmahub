import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { processSmileOneOrder } from '@/lib/smileone';
import { processUniPinOrder } from '@/lib/unipin';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Secure API route for Admins to trigger fulfillment.
 * Keeps API keys and secrets on the server.
 */
export async function POST(req: NextRequest) {
  const { db } = initializeFirebase();
  
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
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

    return NextResponse.json({ success: true, message: 'Fulfillment process initialized' });
  } catch (error: any) {
    console.error('Fulfillment trigger error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
