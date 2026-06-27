
import { NextRequest, NextResponse } from 'next/server';

/**
 * DECOMMISSIONED: Telegram webhook integration has been removed.
 */
export async function POST(req: NextRequest) {
  return NextResponse.json({ ok: false, message: 'Integration decommissioned.' });
}
