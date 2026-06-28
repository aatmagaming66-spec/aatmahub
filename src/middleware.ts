import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  const protectedRoutes = ['/dashboard', '/admin', '/checkout'];

  const isProtected = protectedRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  );

    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}
