// Middleware for route protection
// Last updated: 2025-10-13

import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public pages (can redirect if already authenticated)
  const publicPages = ["/login"];

  // Setup page (requires authentication, no redirect)
  const setupPages = ["/setup"];

  // Public API routes (always accessible, never redirect)
  const publicApiRoutes = [
    "/api/auth/login",
    "/api/auth/logout",
    "/api/auth/setup",
  ];

  // Check if current path is public or setup
  const isPublicPage = publicPages.some((route) => pathname.startsWith(route));
  const isSetupPage = setupPages.some((route) => pathname.startsWith(route));
  const isPublicApi = publicApiRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Get session cookie
  const session = request.cookies.get("guru_wali_session");

  // If accessing public page and already logged in, redirect to dashboard
  if (isPublicPage && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If accessing protected route (not public page/api/setup) and not logged in, redirect to login
  if (!isPublicPage && !isPublicApi && !isSetupPage && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing setup page without session, redirect to login
  if (isSetupPage && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
