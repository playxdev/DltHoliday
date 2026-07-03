const AUTH_STORE_KEY = "dlt_auth_session";

export interface AuthSession {
  token: string;
  username: string;
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setStoredSession(session: AuthSession | null): void {
  if (typeof window === "undefined") return;
  if (session) {
    localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(AUTH_STORE_KEY);
  }
}

export function getApiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return `${base}${path}`;
}

export async function fetchWithAuth(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const session = getStoredSession();
  const headers = new Headers(options?.headers);

  if (session) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  if (!headers.has("Content-Type") && options?.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }

  return fetch(getApiUrl(path), {
    ...options,
    headers,
  });
}
