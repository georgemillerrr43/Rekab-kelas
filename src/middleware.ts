import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'session_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, auth API, public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon.svg' ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/api/uploads') ||
    pathname.startsWith('/api/recap') ||
    pathname.startsWith('/api/classes')
  ) {
    return NextResponse.next();
  }

  const publicRoutes = ['/recap', '/recap/public', '/recap/public/'];
  if (publicRoutes.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    return NextResponse.next();
  }

  // Read session cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let userRole: 'ADMIN' | 'GURU' | 'SISWA' | null = null;
  if (sessionToken) {
    const rolePrefix = sessionToken.split('.')[0];
    if (rolePrefix === 'ADMIN' || rolePrefix === 'GURU' || rolePrefix === 'SISWA') {
      userRole = rolePrefix;
    }
  }

  // Login page
  if (pathname === '/login') {
    if (userRole === 'ADMIN') return NextResponse.redirect(new URL('/', request.url));
    if (userRole === 'GURU') return NextResponse.redirect(new URL('/teacher', request.url));
    if (userRole === 'SISWA') return NextResponse.redirect(new URL('/student', request.url));
    return NextResponse.next();
  }

  // Not logged in
  if (!userRole) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // SISWA: only /student and /api/student
  if (userRole === 'SISWA') {
    if (pathname.startsWith('/student') || pathname.startsWith('/api/student')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/student', request.url));
  }

  // GURU: only /teacher and /api/teacher
  if (userRole === 'GURU') {
    if (pathname.startsWith('/teacher') || pathname.startsWith('/api/teacher')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/teacher', request.url));
  }

  // ADMIN: everything except student/teacher pages
  if (userRole === 'ADMIN') {
    if (pathname.startsWith('/student') || pathname.startsWith('/teacher')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (pathname.startsWith('/api/student') || pathname.startsWith('/api/teacher')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
