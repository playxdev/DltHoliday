import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_COOKIE = "dlt_auth_token";

const PUBLIC_PATHS = new Set(["/login"]);

const PUBLIC_API_PREFIXES = ["/api/auth", "/api/health"];

function getJwtSigningKey(): Uint8Array {
  const raw = process.env.JWT_SIGNING_KEY || process.env.AUTH_SECRET_TOKEN;
  if (!raw) {
    throw new Error("JWT_SIGNING_KEY or AUTH_SECRET_TOKEN env is not set");
  }
  return new TextEncoder().encode(raw);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(JWT_COOKIE)?.value;

  function isApiRoute() {
    return pathname.startsWith("/api/");
  }

  function unauthorized() {
    if (isApiRoute()) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (!token) {
    return unauthorized();
  }

  try {
    await jwtVerify(token, getJwtSigningKey());
    return NextResponse.next();
  } catch {
    const response = unauthorized();
    response.cookies.set(JWT_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
