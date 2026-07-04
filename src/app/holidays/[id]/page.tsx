"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Holiday, HolidayInput, ApiResponse } from "@/types";
import HolidayForm from "@/components/holiday-form";
import { showToast } from "@/components/toast";

export default function EditHolidayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [holiday, setHoliday] = useState<Holiday | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/holidays/${id}`);
        const json: ApiResponse<Holiday> = await res.json();
        if (!json.success || !json.data) {
          throw new Error(json.error || "Holiday not found");
        }
        setHoliday(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load holiday");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSubmit = async (data: HolidayInput) => {
    setSubmitting(true);
    const res = await fetch(`/api/holidays/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json: ApiResponse<Holiday> = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to update");

    showToast("success", "Holiday updated successfully");
    router.push("/holidays");
    router.refresh();
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <svg className="spinner w-6 h-6 text-[var(--accent)]" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error || !holiday) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-medium text-[var(--danger)]">
          {error || "Holiday not found"}
        </p>
        <Link
          href="/holidays"
          className="inline-flex items-center gap-2 mt-4 text-sm text-[var(--accent)] hover:underline"
        >
          <ArrowLeft size={14} /> Back to Holidays
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/holidays"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)]
          hover:text-[var(--text-primary)] mb-6"
      >
        <ArrowLeft size={14} /> Back to Holidays
      </Link>

      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
        Edit Holiday
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Update holiday details for ID #{id}
      </p>

      <div className="rounded-xl border shadow-sm
        bg-[var(--bg-surface)] border-[var(--border)] p-6">
        <HolidayForm
          holiday={holiday}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/holidays")}
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
}
