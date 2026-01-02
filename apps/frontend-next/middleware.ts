import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    const accessToken = request.cookies.get('opprs_access')?.value;

    if (!accessToken) {
      // Redirect to sign-in if no token
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }

    try {
      // Decode JWT payload (without verification - server validates)
      const payload = JSON.parse(atob(accessToken.split('.')[1]));

      if (payload.role !== 'admin') {
        // Redirect to home if not admin
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      // Invalid token, redirect to sign-in
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
