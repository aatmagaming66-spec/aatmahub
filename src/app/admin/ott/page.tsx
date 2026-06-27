'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OttAdminRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin'); }, [router]);
  return null;
}