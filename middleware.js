// middleware.js (plain JavaScript)

import { NextResponse } from "next/server";

// Simple auth check (replace with your real logic)
function isAuthenticated(req) {
  // Example: check a cookie or header
  // const token = req.cookies.get("session")?.value;
  // return Boolean(token);
  return true; // <- allow all for now
}

export function middleware(req) {
  // Protect selected routes below (see config.matcher)
  if (!isAuthenticated(req)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

// Choose the routes you want to protect:
export const config = {
  matcher: [
    "/dashboard/:path*",     // example protected area
    // "/api/private/:path*", // add more patterns if needed
  ],
};
