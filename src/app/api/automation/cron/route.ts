
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
    if (task === 'recovery' || task === 'all') {
      await detectStuckOrders(db);
    }

    if (task === 'report' || task === 'all') {
      // Logic: Only send report if it's after 11:30 PM
      const now = new Date();
      if (now.getHours() === 23 && now.getMinutes() >= 30) {
        await sendDailyOperationalReport(db);
      }
    }

    return NextResponse.json({ 
      ok: true, 
      message: `Automation cycle executed for task: ${task || 'all'}`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
