import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Validates that a redirect path is safe (internal only).
 * Prevents Open Redirect attacks where ?redirect=https://evil.com could be used.
 */
function isSafeRedirectPath(path: string): boolean {
  // Must start with / and not contain protocol indicators or double slashes
  return (
    typeof path === 'string' &&
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.includes('://') &&
    path.startsWith('/admin')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes, but ignore /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('admin_session');

    if (!adminSession || adminSession.value !== 'authenticated') {
      const loginUrl = new URL('/admin/login', request.url);

      // Validate the redirect path before setting it to prevent Open Redirect
      const redirectPath = pathname;
      if (isSafeRedirectPath(redirectPath)) {
        loginUrl.searchParams.set('redirect', redirectPath);
      }

      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

