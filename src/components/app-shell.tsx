"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";
import Header from "./header";
import Footer from "./footer";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/holidays": "Holidays",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("aaa_sidebar_collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("aaa_sidebar_collapsed", String(next));
  };

  const title = pageTitles[pathname] || pathname.replace(/^\//, "") || "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300
          ${collapsed ? "lg:ml-16" : "lg:ml-64"}`}
      >
        <Header
          title={title}
          sidebarCollapsed={collapsed}
          onToggleSidebar={toggleSidebar}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}
