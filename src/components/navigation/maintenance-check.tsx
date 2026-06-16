
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useGlobalSettings } from '@/firebase/settings-context';

export function MaintenanceCheck() {
  const { profile } = useUser();
  const { siteSettings } = useGlobalSettings();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!siteSettings) return;

    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    
    // Check maintenance mode via global context instead of local listener
    if (siteSettings.maintenanceMode && !isAdmin && pathname !== '/maintenance') {
      router.push('/maintenance');
    } else if (!siteSettings.maintenanceMode && pathname === '/maintenance') {
      router.push('/');
    }
  }, [profile, siteSettings, router, pathname]);

  return null;
}
