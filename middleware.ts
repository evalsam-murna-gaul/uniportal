import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    // ─── Role-based page route guards ───
    if (pathname.startsWith('/student') && role !== 'student') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url));
    }

    if (pathname.startsWith('/faculty') && role !== 'faculty') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url));
    }

    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only run middleware when a token exists
      authorized: ({ token }) => !!token,
    },
  }
);

// Apply middleware to all protected paths
export const config = {
  matcher: [
    '/student/:path*',
    '/faculty/:path*',
    '/admin/:path*',
    // API routes are individually protected with withRole() wrappers
    // but you can add them here too for an extra layer
  ],
};