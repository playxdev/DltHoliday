"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggle = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const x = e.clientX;
      const y = e.clientY;
      document.documentElement.style.setProperty("--tx", `${x}px`);
      document.documentElement.style.setProperty("--ty", `${y}px`);

      if ("startViewTransition" in document) {
        (document as any).startViewTransition(() => {
          setTheme(theme === "dark" ? "light" : "dark");
        });
      } else {
        setTheme(theme === "dark" ? "light" : "dark");
      }
    },
    [theme, setTheme]
  );

  if (!mounted) {
    return (
      <div className="nav-icon-btn w-9 h-9 rounded-lg bg-[var(--bg-hover)]" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      className="nav-icon-btn group"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun
        size={20}
        className={`absolute transition-all duration-300
          ${!isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}`}
      />
      <Moon
        size={20}
        className={`absolute transition-all duration-300
          ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}
      />
    </button>
  );
}
