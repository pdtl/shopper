import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTO_APPROVE_AUTH } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login"];
const API_PREFIX = "/api/";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // API routes are protected by API key in the route handlers
  if (path.startsWith(API_PREFIX)) {
    return NextResponse.next();
  }

  // Require "auth" on all pages; for local run we auto-approve by setting a cookie
  const session = request.cookies.get("shopper_session");
  if (AUTO_APPROVE_AUTH) {
    const res = NextResponse.next();
    if (!session?.value) {
      res.cookies.set("shopper_session", "auto-approved", {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  }

  if (PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"))) {
    return NextResponse.next();
  }
  if (!session?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
