
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { processSmileOneOrder } from '@/lib/fulfillment';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Secure API route for Admins to trigger fulfillment.
 * HARDENED: Added internal validation for order ownership and status.
 */
export async function POST(req: NextRequest) {
  const { db } = initializeFirebase();
  
  try {
    const body = await req.json();
    const { orderId, adminUid } = body;

    if (!orderId || !adminUid) {
      return NextResponse.json({ success: false, error: 'Mandatory identifiers missing' }, { status: 400 });
    }

    // Server-side Admin Role Verification
    const adminRef = doc(db, 'users', adminUid);
    const adminSnap = await getDoc(adminRef);
    const adminData = adminSnap.data();

    if (!adminSnap.exists() || !['admin', 'super_admin'].includes(adminData?.role)) {
      console.error(`[Security Audit] Unauthorized fulfillment attempt from UID: ${adminUid}`);
      return NextResponse.json({ success: false, error: 'Unauthorized operational access' }, { status: 403 });
    }

    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      return NextResponse.json({ success: false, error: 'Target record not found' }, { status: 404 });
    }

    const orderData = orderSnap.data();
    if (orderData.status === 'completed') {
      return NextResponse.json({ success: false, error: 'Order already fulfilled' }, { status: 400 });
    }

    // Trigger the Smile.one sequence
    await processSmileOneOrder(db, orderId);

    return NextResponse.json({ 
      success: true, 
      message: 'Fulfillment protocol initiated successfully',
      orderId 
    });
  } catch (error: any) {
    console.error('[Security Audit] Fulfillment exception:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal system fault during fulfillment.' 
    }, { status: 500 });
  }
}
