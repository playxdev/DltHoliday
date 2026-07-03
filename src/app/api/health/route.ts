import { NextResponse } from "next/server";
import { getDbConfigSummary } from "@/lib/db-config";
import { executeQuery } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const config = getDbConfigSummary();

    const result = await executeQuery<{ n: number }>(
      "SELECT 1 AS n"
    );
    const dbConnected = result.length > 0;

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        server: config.server,
        database: config.database,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: { connected: false },
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
