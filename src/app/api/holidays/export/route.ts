import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import type { Holiday } from "@/types";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    let whereClause = "";
    const params: Record<string, unknown> = {};

    if (search) {
      whereClause += " WHERE holiday_name LIKE @search";
      params.search = `%${search}%`;
    }

    if (status) {
      const prefix = whereClause ? " AND" : " WHERE";
      whereClause += `${prefix} active_status = @status`;
      params.status = parseInt(status, 10);
    }

    const rows = await executeQuery<Holiday>(
      `SELECT holiday_name, holiday_date, active_status
       FROM dbo.tb_holiday_server${whereClause}
       ORDER BY holiday_date ASC`,
      params
    );

    const data = rows.map((r) => ({
      holiday_name: r.holiday_name,
      holiday_date: r.holiday_date
        ? new Date(r.holiday_date).toISOString().split("T")[0]
        : "",
      active_status: r.active_status,
    }));

    if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Holidays");

      ws["!cols"] = [
        { wch: 40 },
        { wch: 14 },
        { wch: 8 },
      ];

      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buf, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition":
            'attachment; filename="holidays-export.xlsx"',
        },
      });
    }

    const header = "holiday_name,holiday_date,active_status";
    const csvRows = data.map(
      (r) => `"${r.holiday_name.replace(/"/g, '""')}",${r.holiday_date},${r.active_status}`
    );
    const csv = [header, ...csvRows].join("\n") + "\n";

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="holidays-export.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Export failed",
      },
      { status: 500 }
    );
  }
}
