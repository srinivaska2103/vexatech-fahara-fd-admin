import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow access to auth pages
  const authRoutes = ['/admin/login', '/admin/verify-otp', '/admin/forgot-password', '/admin/reset-password'];
  if (authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for access token or refresh token
  const token = request.cookies.get('adminAccessToken')?.value || request.cookies.get('adminRefreshToken')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
