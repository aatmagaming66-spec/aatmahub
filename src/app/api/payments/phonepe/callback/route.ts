
import { NextResponse } from 'next/server';

/**
 * DECOMMISSIONED
 */
export async function POST() {
  return NextResponse.json({ success: false, error: 'PhonePe integration decommissioned.' }, { status: 410 });
}
