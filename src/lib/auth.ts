import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";

const JWT_COOKIE = "dlt_auth_token";
const JWT_EXPIRY = "8h";

export function getJwtSigningKey(): Uint8Array {
  const raw = process.env.JWT_SIGNING_KEY || process.env.AUTH_SECRET_TOKEN;
  if (!raw) {
    throw new Error("JWT_SIGNING_KEY or AUTH_SECRET_TOKEN env is not set");
  }
  return new TextEncoder().encode(raw);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function validateCredentials(
  username: string,
  password: string,
  token: string
): boolean {
  const envUser = process.env.AUTH_USERNAME;
  const envPass = process.env.AUTH_PASSWORD;
  const envToken = process.env.AUTH_SECRET_TOKEN;

  if (!envUser || !envPass || !envToken) {
    throw new Error("Auth environment variables are not configured");
  }

  return (
    timingSafeEqual(username, envUser) &&
    timingSafeEqual(password, envPass) &&
    timingSafeEqual(token, envToken)
  );
}

export async function createSession(username: string): Promise<string> {
  const key = getJwtSigningKey();
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(key);

  try {
    const cookieStore = await cookies();
    cookieStore.set(JWT_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });
  } catch {
    // cookies() throws outside request context — fine
  }

  return token;
}

export interface Session {
  username: string;
}

export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const key = getJwtSigningKey();
    const { payload } = await jwtVerify(token, key);
    return { username: payload.username as string };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const headerStore = await headers();
    const authHeader = headerStore.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const session = await verifyToken(token);
      if (session) return session;
    }
  } catch {
    // headers() may throw outside request context
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(JWT_COOKIE)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(JWT_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  } catch {
    // ignore
  }
}
