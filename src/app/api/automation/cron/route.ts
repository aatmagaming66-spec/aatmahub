import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { detectStuckOrders, sendDailyOperationalReport } from '@/lib/automation';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

/**
 * Global Automation Cron
 * handles:
 * - order recovery
 * - operational reporting
 */
export async function GET(req: NextRequest) {
  const { db } = initializeFirebase();
  const searchParams = req.nextUrl.searchParams;
  const task = searchParams.get('task');

  try {
    // 1. Order Recovery Logic
    if (task === 'recovery' || task === 'all' || !task) {
      await detectStuckOrders(db);
    }

    // 2. Operational Reports
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