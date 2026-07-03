import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import type { Holiday, HolidayInput, ApiResponse } from "@/types";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await executeQuery<Holiday>(
      "SELECT * FROM dbo.tb_holiday_server WHERE holiday_id = @id",
      { id: parseInt(id, 10) }
    );

    if (result.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Holiday not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Holiday> = {
      success: true,
      data: result[0],
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch holiday",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: HolidayInput = await request.json();

    const existing = await executeQuery<Holiday>(
      "SELECT * FROM dbo.tb_holiday_server WHERE holiday_id = @id",
      { id: parseInt(id, 10) }
    );

    if (existing.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Holiday not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    await executeQuery(
      `UPDATE dbo.tb_holiday_server
       SET holiday_name = @holiday_name,
           holiday_date = @holiday_date,
           update_by = @update_by,
           active_status = COALESCE(@active_status, active_status),
           update_date = GETDATE()
       WHERE holiday_id = @id`,
      {
        id: parseInt(id, 10),
        holiday_name: body.holiday_name,
        holiday_date: body.holiday_date,
        update_by: "ADMIN",
        active_status: body.active_status ?? null,
      }
    );

    const updated = await executeQuery<Holiday>(
      "SELECT * FROM dbo.tb_holiday_server WHERE holiday_id = @id",
      { id: parseInt(id, 10) }
    );

    const response: ApiResponse<Holiday> = {
      success: true,
      data: updated[0],
      message: "Holiday updated successfully",
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update holiday",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await executeQuery<Holiday>(
      "SELECT * FROM dbo.tb_holiday_server WHERE holiday_id = @id",
      { id: parseInt(id, 10) }
    );

    if (existing.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Holiday not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    await executeQuery(
      "UPDATE dbo.tb_holiday_server SET active_status = 0, update_date = GETDATE(), update_by = @update_by WHERE holiday_id = @id",
      { id: parseInt(id, 10), update_by: "ADMIN" }
    );

    const response: ApiResponse<null> = {
      success: true,
      message: "Holiday deactivated successfully",
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete holiday",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
