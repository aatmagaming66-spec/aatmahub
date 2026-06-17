'use client';
/**
 * DECOMMISSIONED: Media Hub Page
 * This route is now restricted and redirects to Admin Dashboard.
 */
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DecommissionedPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin'); }, [router]);
  return null;
}
