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

    const jwt = await createSession(username);

    return NextResponse.json({ success: true, token: jwt });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      },
      { status: 500 }
    );
  }
}
