"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ApiResponse, DashboardStats } from "@/types";
import StatCard from "@/components/stat-card";
import { fetchWithAuth } from "@/lib/auth-store";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Plus,
  Pencil,
  Ban,
  Loader2,
} from "lucide-react";

function formatDateTime(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const actionStyles: Record<string, { icon: React.ReactNode; badge: string }> = {
  Created: {
    icon: <Plus size={12} />,
    badge: "badge-success",
  },
  Updated: {
    icon: <Pencil size={12} />,
    badge: "badge-info",
  },
  Deactivated: {
    icon: <Ban size={12} />,
    badge: "badge-danger",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    inactive: 0,
    upcoming: 0,
    activityLog: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchWithAuth("/api/dashboard");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json: ApiResponse<DashboardStats> = await res.json();
        if (!json.success || !json.data) {
          throw new Error(json.error || "Failed to load dashboard");
        }
        setStats(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="spinner text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Overview of your holiday management system
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg border
          border-amber-200 bg-[var(--warning-bg)] text-[var(--warning-text)] text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Holidays"
          value={stats.total}
          description="All time"
          icon={<CalendarDays size={22} />}
        />
        <StatCard
          title="Active"
          value={stats.active}
          description="Currently active"
          icon={<CheckCircle2 size={22} />}
        />
        <StatCard
          title="Inactive"
          value={stats.inactive}
          description="Deactivated"
          icon={<XCircle size={22} />}
        />
        <StatCard
          title="Upcoming"
          value={stats.upcoming}
          description="From today onward"
          icon={<CalendarClock size={22} />}
        />
      </div>

      <div className="rounded-xl border shadow-sm
        bg-[var(--bg-surface)] border-[var(--border)]">
        <div className="px-6 py-4 border-b border-[var(--border-light)]">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            Activity Log
          </h3>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Holiday</th>
                <th>Date / Time</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {stats.activityLog.length > 0 ? (
                stats.activityLog.map((entry, i) => {
                  const style = actionStyles[entry.action] || actionStyles.Updated;
                  return (
                    <tr key={i}>
                      <td>
                        <span className={`badge ${style.badge} whitespace-nowrap`}>
                          {style.icon}
                          {entry.action}
                        </span>
                      </td>
                      <td className="font-medium text-[var(--text-primary)]">
                        {entry.holiday_name}
                      </td>
                      <td className="text-[var(--text-muted)] text-xs">
                        {formatDateTime(entry.action_date)}
                      </td>
                      <td className="text-[var(--text-muted)] text-xs">
                        {entry.by_user || "-"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-[var(--text-muted)] text-sm">
                    NO ACTIVITY YET
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
