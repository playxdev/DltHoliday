"use client";

import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  title: string;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  children?: React.ReactNode;
}

export default function Header({
  title,
  sidebarCollapsed,
  onToggleSidebar,
  children,
}: HeaderProps) {
  return (
    <header
      className="h-16 flex items-center gap-4 px-4 lg:px-6 flex-shrink-0
        border-b border-[var(--border)] bg-[var(--bg-surface)]"
    >
      <button
        onClick={onToggleSidebar}
        className="nav-icon-btn"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
      </button>

      <h1 className="text-lg font-semibold text-[var(--text-primary)] flex-1">
        {title}
      </h1>

      <ThemeToggle />

      <div id="header-actions" className="flex items-center gap-2">
        {children}
      </div>
    </header>
  );
}
