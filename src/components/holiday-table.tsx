"use client";

import type { Holiday } from "@/types";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface HolidayTableProps {
  holidays: Holiday[];
  onDelete: (holiday: Holiday) => void;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function HolidayTable({
  holidays,
  onDelete,
}: HolidayTableProps) {
  if (holidays.length === 0) {
    return (
      <td colSpan={6} className="text-center py-6 text-[var(--text-muted)] text-sm">
        0/0 RECORD
      </td>
    );
  }

  return (
    <>
      {holidays.map((holiday) => {
        const isActive = holiday.active_status === 1;
        return (
          <tr key={holiday.holiday_id}>
            <td className="font-medium text-[var(--text-primary)]">
              {holiday.holiday_name}
            </td>
            <td className="text-[var(--text-secondary)]">
              {formatDate(holiday.holiday_date)}
            </td>
            <td>
              <span
                className={`badge ${isActive ? "badge-success" : "badge-danger"}`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </td>
            <td className="text-[var(--text-secondary)] text-xs">
              <div>{formatDate(holiday.create_date)}</div>
              <div className="text-[var(--text-muted)]">
                by {holiday.create_by}
              </div>
            </td>
            <td className="text-[var(--text-secondary)] text-xs">
              <div>{formatDate(holiday.update_date)}</div>
              <div className="text-[var(--text-muted)]">
                by {holiday.update_by || "-"}
              </div>
            </td>
            <td className="text-right">
              <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/holidays/${holiday.holiday_id}`}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md
                      text-[var(--text-muted)] hover:text-[var(--accent)]
                      hover:bg-[var(--bg-hover)] transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => onDelete(holiday)}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md
                      text-[var(--text-muted)] hover:text-[var(--danger)]
                      hover:bg-[var(--bg-hover)] transition-colors"
                    title="Deactivate"
                  >
                    <Trash2 size={14} />
                  </button>
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}
