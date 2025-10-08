import { NextResponse } from "next/server";

function isAuthenticated(req) {
  // Replace with your real auth check later
  return true;
}

export function middleware(req) {
  if (!isAuthenticated(req)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
