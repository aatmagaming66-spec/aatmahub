
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * AATMA HUB MIDDLEWARE
 * Simplified to prevent blocking the development preview pane.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api/payments|_next/static|_next/image|favicon.ico|logo.png).*)',
};
