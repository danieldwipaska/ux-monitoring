import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/register'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // API routes that require API key (not user auth)
  const apiKeyRoutes = ['/api/logs'];
  const isApiKeyRoute = apiKeyRoutes.some(route => pathname.startsWith(route)) && request.method === 'POST';

  // Allow public routes and API key routes
  if (isPublicRoute || isApiKeyRoute) {
    return NextResponse.next();
  }

  // Redirect to login if no token and trying to access protected route
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if logged in and trying to access login
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
