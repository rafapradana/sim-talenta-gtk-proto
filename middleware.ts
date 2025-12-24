import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;

  // Public routes
  const publicRoutes = ["/login", "/api/auth/login"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // API routes that need auth
  const isApiRoute = pathname.startsWith("/api") && !pathname.startsWith("/api/auth/login");

  // Admin routes
  const isAdminRoute = pathname.startsWith("/admin");

  // Redirect to login if accessing protected route without token
  if (!accessToken && (isAdminRoute || isApiRoute)) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to admin if already logged in and accessing login page
  if (accessToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Redirect root to admin or login
  if (pathname === "/") {
    if (accessToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
