import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import type { ApiResponse } from "@/types";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

interface ImportRow {
  holiday_name?: string;
  holiday_date?: string;
  active_status?: string;
}

interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
}

const ALLOWED_MIMES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

function normalizeDate(raw: unknown): string | null {
  if (!raw) return null;

  if (raw instanceof Date) {
    return raw.toISOString().split("T")[0];
  }

  const str = String(raw).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(str)) {
    const [d, m, y] = str.split("/");
    const fullYear = parseInt(y) < 50 ? `20${y}` : `19${y}`;
    return `${fullYear}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }

  return null;
}

function normalizeStatus(raw: unknown): number {
  const s = String(raw || "").trim().toUpperCase();
  return s === "0" || s === "I" || s === "INACTIVE" ? 0 : 1;
}

export async function POST(request: NextRequest) {
  const result: ImportResult = { total: 0, imported: 0, skipped: 0, errors: [] };

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const replaceAll = formData.get("replaceAll") === "true";

    if (!file) {
      result.errors.push("No file provided");
      return NextResponse.json({ success: false, ...result }, { status: 400 });
    }

    if (!ALLOWED_MIMES.includes(file.type)) {
      result.errors.push(
        `Unsupported file type: ${file.type}. Please upload CSV or Excel (.xls/.xlsx).`
      );
      return NextResponse.json({ success: false, ...result }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      result.errors.push("No sheet found in file");
      return NextResponse.json({ success: false, ...result }, { status: 400 });
    }

    const sheet = workbook.Sheets[sheetName];
    const rows: ImportRow[] = XLSX.utils.sheet_to_json<ImportRow>(sheet, {
      defval: "",
      raw: false,
    });

    if (rows.length === 0) {
      result.errors.push("No data rows found in file");
      return NextResponse.json({ success: false, ...result }, { status: 400 });
    }

    if (replaceAll) {
      await executeQuery("DELETE FROM dbo.tb_holiday_server");
    }

    const headerMap = detectColumns(Object.keys(rows[0]));

    for (const row of rows) {
      result.total++;

      const holidayName = String(
        row[headerMap.name as keyof ImportRow] || row.holiday_name || ""
      ).trim();

      if (!holidayName) {
        result.errors.push(`Row ${result.total}: missing holiday name`);
        result.skipped++;
        continue;
      }

      const dateRaw = row[headerMap.date as keyof ImportRow] || row.holiday_date;
      const holidayDate = normalizeDate(dateRaw);

      if (!holidayDate) {
        result.errors.push(
          `Row ${result.total} ("${holidayName}"): invalid date`
        );
        result.skipped++;
        continue;
      }

      const statusRaw =
        row[headerMap.status as keyof ImportRow] || row.active_status;
      const activeStatus = normalizeStatus(statusRaw);

      try {
        await executeQuery(
          `INSERT INTO dbo.tb_holiday_server
           (holiday_name, holiday_date, create_by, active_status, create_date, update_date)
           VALUES (@holiday_name, @holiday_date, @create_by, @active_status, GETDATE(), GETDATE())`,
          {
            holiday_name: holidayName,
            holiday_date: holidayDate,
            create_by: "IMPORT",
            active_status: activeStatus,
          }
        );
        result.imported++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "DB error";
        result.errors.push(
          `Row ${result.total} ("${holidayName}"): ${msg}`
        );
        result.skipped++;
      }
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    result.errors.push(
      error instanceof Error ? error.message : "Failed to process file"
    );
    return NextResponse.json({ success: false, ...result }, { status: 500 });
  }
}

function detectColumns(headers: string[]): Record<string, string> {
  const map: Record<string, string> = { name: "", date: "", status: "" };

  for (const h of headers) {
    const lower = h.toLowerCase().replace(/[\s_-]+/g, "");

    if (!map.name && (lower.includes("holidayname") || lower.includes("name") || lower === "holiday")) {
      map.name = h;
    } else if (!map.date && (lower.includes("holidaydate") || lower.includes("date"))) {
      map.date = h;
    } else if (!map.status && (lower.includes("status") || lower.includes("active"))) {
      map.status = h;
    }
  }

  return map;
}
