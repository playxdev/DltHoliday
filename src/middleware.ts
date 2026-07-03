import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_COOKIE = "dlt_auth_token";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "";

const PUBLIC_PATHS = new Set(["/login"]);

const PUBLIC_API_PREFIXES = ["/api/auth", "/api/health"];

function getJwtSigningKey(): Uint8Array {
  const raw = process.env.JWT_SIGNING_KEY || process.env.AUTH_SECRET_TOKEN;
  if (!raw) {
    throw new Error("JWT_SIGNING_KEY or AUTH_SECRET_TOKEN env is not set");
  }
  return new TextEncoder().encode(raw);
}

function addCorsHeaders(response: NextResponse): NextResponse {
  if (CORS_ORIGIN) {
    response.headers.set("Access-Control-Allow-Origin", CORS_ORIGIN);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }
  return response;
}

function getToken(request: NextRequest): string | null {
  const cookieToken = request.cookies.get(JWT_COOKIE)?.value;
  if (cookieToken) return cookieToken;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (CORS_ORIGIN && request.method === "OPTIONS") {
    return addCorsHeaders(new NextResponse(null, { status: 204 }));
  }

  if (
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return addCorsHeaders(NextResponse.next());
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js)$/)
  ) {
    return addCorsHeaders(NextResponse.next());
  }

  const token = getToken(request);

  function isApiRoute() {
    return pathname.startsWith("/api/");
  }

  function unauthorized() {
    if (isApiRoute()) {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        )
      );
    }
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return addCorsHeaders(NextResponse.redirect(url));
  }

  if (!token) {
    return unauthorized();
  }

  try {
    await jwtVerify(token, getJwtSigningKey());
    return addCorsHeaders(NextResponse.next());
  } catch {
    const response = unauthorized();
    response.cookies.set(JWT_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
