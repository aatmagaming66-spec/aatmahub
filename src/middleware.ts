
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * AATMA HUB SECURITY MIDDLEWARE
 * Injects hardened headers to protect against common web vulnerabilities.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Content Security Policy (Optimized for Firebase/Cloudinary)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://firebasestorage.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https:;
    frame-src 'self' https://*.firebaseapp.com https://*.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  // 2. Anti-Clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // 3. Anti-MIME Sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // 4. Privacy-First Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 5. Feature Restriction
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  // Apply to all routes except internal assets and public static files
  matcher: '/((?!api/payments|_next/static|_next/image|favicon.ico|logo.png).*)',
};
