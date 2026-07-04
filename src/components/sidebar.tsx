"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  LogOut,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { getStoredSession, setStoredSession } from "@/lib/auth-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/holidays", label: "Holidays", icon: CalendarDays },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const session = getStoredSession();
  const username = session?.username || "Admin";
  const avatarLetter = username.charAt(0).toUpperCase();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/login");
  }

  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 z-30 bg-[var(--modal-overlay)] lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full flex flex-col
          border-r border-[var(--border)] bg-[var(--bg-surface)]
          transition-all duration-300 overflow-hidden
          ${collapsed ? "w-16" : "w-64"}
          ${collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}`}
      >
        <div
          className={`flex items-center gap-3 px-5 h-16
            ${collapsed ? "justify-center px-0" : ""}`}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-base font-bold text-[var(--text-primary)] leading-tight">
                DLT Holiday
              </h1>
              <p className="text-[11px] text-[var(--text-muted)]">
                Holiday Admin
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="px-5 py-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-semibold text-xs">{avatarLetter}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {username}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Administrator
                </p>
              </div>
              <button
                className="nav-icon-btn text-[var(--text-muted)] hover:text-[var(--danger)]"
                title="Logout"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <Loader2 size={18} className="spinner" />
                ) : (
                  <LogOut size={18} />
                )}
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
