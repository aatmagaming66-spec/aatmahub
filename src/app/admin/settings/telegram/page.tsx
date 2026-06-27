
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * DECOMMISSIONED
 * Redirecting away from removed Telegram settings.
 */
export default function TelegramSettingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/system');
  }, [router]);
  return null;
}
