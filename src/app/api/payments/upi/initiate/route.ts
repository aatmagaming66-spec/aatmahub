
import { NextResponse } from 'next/server';

/**
 * DECOMMISSIONED: Automated UPI Gateway has been removed.
 */
export async function POST() {
  return NextResponse.json({ 
    success: false, 
    error: 'Automated payment gateways have been decommissioned. Please use manual top-up.' 
  }, { status: 410 });
}
