"use client";

import { useState } from "react";
import type { Holiday, HolidayInput } from "@/types";

interface HolidayFormProps {
  holiday?: Holiday | null;
  onSubmit: (data: HolidayInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function HolidayForm({
  holiday,
  onSubmit,
  onCancel,
  isSubmitting,
}: HolidayFormProps) {
  const [form, setForm] = useState<HolidayInput>({
    holiday_name: holiday?.holiday_name || "",
    holiday_date: holiday?.holiday_date
      ? new Date(holiday.holiday_date).toISOString().split("T")[0]
      : "",
    active_status: holiday?.active_status ?? 1,
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.holiday_name.trim()) {
      setError("Holiday name is required");
      return;
    }
    if (!form.holiday_date) {
      setError("Holiday date is required");
      return;
    }

    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save holiday");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-200
          bg-[rgba(239,68,68,0.1)] text-[var(--danger)] text-sm flex items-start gap-2">
          <span className="shrink-0 mt-0.5">&#9888;</span>
          <span>{error}</span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="holiday_name">Holiday Name</label>
        <input
          id="holiday_name"
          type="text"
          value={form.holiday_name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, holiday_name: e.target.value }))
          }
          placeholder="e.g. New Year's Day"
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="holiday_date">Holiday Date</label>
        <input
          id="holiday_date"
          type="date"
          value={form.holiday_date}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, holiday_date: e.target.value }))
          }
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="active_status">Status</label>
        <select
          id="active_status"
          value={form.active_status}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, active_status: parseInt(e.target.value, 10) }))
          }
          className="form-input"
        >
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting
            ? "Saving..."
            : holiday
              ? "Update Holiday"
              : "Create Holiday"}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
