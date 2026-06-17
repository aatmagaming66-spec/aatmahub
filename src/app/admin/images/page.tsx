'use client';
/**
 * DECOMMISSIONED: Image Management Page
 */
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DecommissionedPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin'); }, [router]);
  return null;
}
