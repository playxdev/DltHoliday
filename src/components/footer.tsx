"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [statusText, setStatusText] = useState("Checking...");
  const [statusColor, setStatusColor] = useState("var(--text-muted)");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => {
        if (data?.status === "ok" && data?.database?.connected) {
          setStatusText("System Online");
          setStatusColor("var(--success-text)");
        } else if (data?.status === "ok") {
          setStatusText("DB Offline");
          setStatusColor("var(--warning-text)");
        } else {
          setStatusText("System Issue");
          setStatusColor("var(--danger)");
        }
      })
      .catch(() => {
        setStatusText("Offline");
        setStatusColor("var(--danger)");
      });
  }, []);

  return (
    <footer
      className="h-8 flex items-center justify-between px-4 lg:px-6 flex-shrink-0
        border-t border-[var(--border)] bg-[var(--bg-surface)]"
    >
      <span className="text-xs text-[var(--text-muted)]">
        &copy; PlayDevX &middot; v1.3.0
      </span>
      <span
        id="system-status"
        className="text-xs font-medium"
        style={{ color: statusColor }}
      >
        {statusText}
      </span>
    </footer>
  );
}
