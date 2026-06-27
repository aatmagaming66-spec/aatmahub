
import { NextResponse } from 'next/server';

/**
 * DECOMMISSIONED
 * Redirecting away from removed PhonePe integration.
 */
export async function POST() {
  return NextResponse.json({ success: false, error: 'PhonePe integration decommissioned.' }, { status: 410 });
}
