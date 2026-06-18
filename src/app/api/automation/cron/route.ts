import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { detectStuckOrders, sendDailyOperationalReport } from '@/lib/automation';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

/**
 * Global Automation Cron
 * handles:
 * - order recovery
 * - operational reporting
 * - rank maintenance (90-day expiry enforcement)
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

    // 2. Rank Maintenance (Backend Rank Expiry Enforcement)
    if (task === 'rank-maintenance' || task === 'all') {
      const now = new Date().toISOString();
      const expiredRanksQuery = query(
        collection(db, 'users'),
        where('rankExpiry', '<', now)
      );
      
      const expiredUsers = await getDocs(expiredRanksQuery);
      console.log(`[Rank Maintenance] Detected ${expiredUsers.size} expired memberships.`);
      
      for (const userDoc of expiredUsers.docs) {
        // Demote to Warrior on expiry
        await updateDoc(doc(db, 'users', userDoc.id), {
          currentRank: 'Warrior',
          rankId: 'warrior',
          lifetimeSpend: 0, // Option: Reset spend for fresh 90-day cycle or keep but flag as inactive
          rankExpiry: null,
          updatedAt: new Date().toISOString()
        });
      }
    }

    // 3. Operational Reports
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
