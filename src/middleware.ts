import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTO_APPROVE_AUTH = process.env.AUTO_APPROVE_AUTH !== "false";
const PUBLIC_PATHS = ["/", "/login"];
const API_PREFIX = "/api/";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // API routes are protected by API key in the route handlers
  if (path.startsWith(API_PREFIX)) {
    return NextResponse.next();
  }

  if (AUTO_APPROVE_AUTH) {
    const res = NextResponse.next();
    const session = request.cookies.get("shopper_session");
    if (!session?.value) {
      res.cookies.set("shopper_session", "auto-approved", {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  }

  // Require session on all non-public pages
  if (PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"))) {
    return NextResponse.next();
  }
  const session = request.cookies.get("shopper_session");
  if (!session?.value || session.value === "auto-approved") {
    const res = NextResponse.redirect(new URL("/login", request.url));
    if (session?.value === "auto-approved") {
      res.cookies.delete("shopper_session");
    }
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
