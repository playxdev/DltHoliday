import { NextResponse } from "next/server";
import { validateCredentials, createSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { username, password, token } = await request.json();

    if (!username || !password || !token) {
      return NextResponse.json(
        { success: false, error: "Username, password, and token are required" },
        { status: 400 }
      );
    }

    if (!validateCredentials(username, password, token)) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    await createSession(username);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
