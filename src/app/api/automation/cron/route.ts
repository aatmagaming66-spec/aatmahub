import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { detectStuckOrders, sendDailyOperationalReport } from '@/lib/automation';

export async function GET(req: NextRequest) {
  const { db } = initializeFirebase();
  const searchParams = req.nextUrl.searchParams;
  const task = searchParams.get('task');

  try {
    if (task === 'recovery' || task === 'all' || !task) {
      await detectStuckOrders(db);
    }

    if (task === 'report' || task === 'all') {
      await sendDailyOperationalReport(db);
    }

    return NextResponse.json({ 
      ok: true, 
      message: `Automation cycle executed successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Automation Cron Error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}