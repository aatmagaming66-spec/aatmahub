
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { detectStuckOrders, sendDailyOperationalReport } from '@/lib/automation';

/**
 * Automation Worker Endpoint
 * Designed to be triggered by external CRON (e.g. GitHub Actions, Vercel Cron, Google Cloud Scheduler)
 */
export async function GET(req: NextRequest) {
  const { db } = initializeFirebase();
  const searchParams = req.nextUrl.searchParams;
  const task = searchParams.get('task'); // 'recovery', 'report', 'all'

  try {
    if (task === 'recovery' || task === 'all' || !task) {
      await detectStuckOrders(db);
    }

    if (task === 'report' || task === 'all') {
      // Logic: Send report if requested explicitly or at the end of the day
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
