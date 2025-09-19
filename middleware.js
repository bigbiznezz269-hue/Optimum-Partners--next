// middleware.ts (place at the project root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Replace with your real auth check as needed
function isAuthenticated(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  return Boolean(token);
}

const PUBLIC_PATHS = new Set([
  "/",              // homepage
  "/submission",    // form page
  "/success",       // thank-you page
  "/api/leads",     // form POST endpoint
  "/favicon.ico",
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next internals & static
  const isInternal =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/assets");

  if (isInternal || PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Everything else requires auth
  if (!isAuthenticated(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.search = `redirect=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes so we can skip internally in code
  matcher: ["/:path*"],
};