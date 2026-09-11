import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'housefull-game-secret-key-change-in-production';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

const publicPaths = ['/', '/login', '/login/admin', '/register', '/case-study', '/guidelines'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, images, fonts, and API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/fonts') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Game routes require team-token cookie
  if (pathname.startsWith('/game')) {
    const teamToken = request.cookies.get('team-token')?.value;
    if (!teamToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Admin routes require admin JWT session
  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('oxg-session')?.value;
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login/admin', request.url));
    }
    try {
      const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login/admin', request.url));
      }
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/login/admin', request.url));
    }
  }

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
