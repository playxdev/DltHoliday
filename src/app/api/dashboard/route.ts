import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import type { ApiResponse, DashboardStats, ActivityLogEntry } from "@/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [totalResult] = await executeQuery<{ total: number }>(
      "SELECT COUNT(*) AS total FROM dbo.tb_holiday_server"
    );

    const [activeResult] = await executeQuery<{ total: number }>(
      "SELECT COUNT(*) AS total FROM dbo.tb_holiday_server WHERE active_status = 1"
    );

    const [inactiveResult] = await executeQuery<{ total: number }>(
      "SELECT COUNT(*) AS total FROM dbo.tb_holiday_server WHERE active_status = 0"
    );

    const [upcomingResult] = await executeQuery<{ total: number }>(
      "SELECT COUNT(*) AS total FROM dbo.tb_holiday_server WHERE holiday_date >= CAST(GETDATE() AS DATE) AND active_status = 1"
    );

    const activityLog = await executeQuery<ActivityLogEntry>(
      `SELECT holiday_name,
              action,
              action_date,
              by_user
       FROM (
         SELECT holiday_name,
                'Created' AS action,
                create_date AS action_date,
                create_by AS by_user
         FROM dbo.tb_holiday_server

         UNION ALL

         SELECT holiday_name,
                CASE WHEN active_status = 0 THEN 'Deactivated' ELSE 'Updated' END AS action,
                update_date AS action_date,
                update_by AS by_user
         FROM dbo.tb_holiday_server
         WHERE update_date > create_date
       ) AS log
       ORDER BY action_date DESC
       OFFSET 0 ROWS FETCH NEXT 15 ROWS ONLY`
    );

    const stats: DashboardStats = {
      total: totalResult?.total || 0,
      active: activeResult?.total || 0,
      inactive: inactiveResult?.total || 0,
      upcoming: upcomingResult?.total || 0,
      activityLog,
    };

    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch dashboard stats",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
