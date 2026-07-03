import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import type { Holiday, HolidayInput, ApiResponse, PaginatedResponse } from "@/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const offset = (page - 1) * pageSize;

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

    const countParams: Record<string, unknown> = {};
    if (search) countParams.search = `%${search}%`;
    if (status) countParams.status = parseInt(status, 10);

    const countResult = await executeQuery<{ total: number }>(
      `SELECT COUNT(*) AS total FROM dbo.tb_holiday_server${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    const holidays = await executeQuery<Holiday>(
      `SELECT * FROM dbo.tb_holiday_server${whereClause}
       ORDER BY holiday_date DESC
       OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
      { ...params, offset, pageSize }
    );

    const paginated: PaginatedResponse<Holiday> = {
      success: true,
      data: holidays,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json(paginated);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch holidays",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: HolidayInput = await request.json();

    if (!body.holiday_name || !body.holiday_date) {
      const response: ApiResponse<null> = {
        success: false,
        error: "holiday_name and holiday_date are required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    await executeQuery(
      `INSERT INTO dbo.tb_holiday_server
       (holiday_name, holiday_date, create_by, active_status, create_date, update_date)
       VALUES (@holiday_name, @holiday_date, @create_by, @active_status, GETDATE(), GETDATE())`,
      {
        holiday_name: body.holiday_name,
        holiday_date: body.holiday_date,
        create_by: body.create_by || "ADMIN",
        active_status: body.active_status ?? 1,
      }
    );

    const inserted = await executeQuery<Holiday>(
      "SELECT TOP 1 * FROM dbo.tb_holiday_server WHERE holiday_id = SCOPE_IDENTITY()"
    );

    const response: ApiResponse<Holiday> = {
      success: true,
      data: inserted[0],
      message: "Holiday created successfully",
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create holiday",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
