"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, ChevronLeft, ChevronRight, Upload, Download } from "lucide-react";
import type { Holiday, HolidayInput, PaginatedResponse, ApiResponse } from "@/types";
import HolidayTable from "@/components/holiday-table";
import HolidayForm from "@/components/holiday-form";
import DeleteDialog from "@/components/delete-dialog";
import ImportDialog from "@/components/import-dialog";
import { showToast } from "@/components/toast";
import { fetchWithAuth, getApiUrl } from "@/lib/auth-store";

export default function HolidaysPage() {
  const router = useRouter();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleExport = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    window.open(getApiUrl(`/api/holidays/export?${params.toString()}`), "_blank");
  };

  const [deleteTarget, setDeleteTarget] = useState<Holiday | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", "20");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetchWithAuth(`/api/holidays?${params.toString()}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json: PaginatedResponse<Holiday> = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Failed to load holidays");
      }

      setHolidays(json.data);
      setTotalPages(json.totalPages);
      setTotal(json.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load holidays");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, router]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleCreate = async (data: HolidayInput) => {
    setSubmitting(true);
    const res = await fetchWithAuth("/api/holidays", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json: ApiResponse<Holiday> = await res.json();

    if (!json.success) throw new Error(json.error || "Failed to create holiday");

    setShowForm(false);
    showToast("success", "Holiday created successfully");
    setPage(1);
    await fetchHolidays();
    setSubmitting(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetchWithAuth(`/api/holidays/${deleteTarget.holiday_id}`, {
        method: "DELETE",
      });
      const json: ApiResponse<null> = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to deactivate");

      showToast("success", "Holiday deactivated successfully");
      setDeleteTarget(null);
      fetchHolidays();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Operation failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHolidays();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {total} holiday{total !== 1 ? "s" : ""} total
        </p>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="btn btn-secondary">
            <Download size={16} />
            Export
          </button>
          <button onClick={() => setShowImport(true)} className="btn btn-secondary">
            <Upload size={16} />
            Import
          </button>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus size={16} />
            New Holiday
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search holidays by name..."
              className="form-input pl-9"
            />
          </div>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="form-input w-auto"
        >
          <option value="">All Status</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg border border-amber-200
          bg-[var(--warning-bg)] text-[var(--warning-text)] text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-xl border shadow-sm
          bg-[var(--bg-surface)] border-[var(--border)] p-6">
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Create New Holiday
          </h3>
          <HolidayForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isSubmitting={submitting}
          />
        </div>
      )}

      <div className="rounded-xl border shadow-sm
        bg-[var(--bg-surface)] border-[var(--border)]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="spinner w-6 h-6 text-[var(--accent)]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <HolidayTable holidays={holidays} onDelete={setDeleteTarget} />
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-[var(--text-muted)]">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn btn-secondary btn-sm"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn btn-secondary btn-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {deleteTarget && (
        <DeleteDialog
          holidayName={deleteTarget.holiday_name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={deleting}
        />
      )}

      {showImport && (
        <ImportDialog
          onClose={() => setShowImport(false)}
          onImported={() => { setPage(1); fetchHolidays(); }}
        />
      )}
    </div>
  );
}
