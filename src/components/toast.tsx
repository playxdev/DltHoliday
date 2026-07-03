"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export interface ToastData {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

let toastId = 0;
const listeners: Set<(t: ToastData) => void> = new Set();

export function showToast(type: ToastData["type"], message: string) {
  const toast: ToastData = { id: ++toastId, type, message };
  listeners.forEach((fn) => fn(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handler = (toast: ToastData) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3000);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle size={18} className="text-[var(--success-text)]" />,
    error: <AlertCircle size={18} className="text-[var(--danger)]" />,
    info: <Info size={18} className="text-[var(--accent)]" />,
  };

  const styles = {
    success: "bg-[var(--success-bg)] border-[var(--success-bg)]",
    error: "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.15)]",
    info: "bg-[var(--info-bg)] border-[var(--info-bg)]",
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] space-y-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
            ${styles[toast.type]}`}
          style={{ animation: "slideDown 0.3s ease-out" }}
        >
          {icons[toast.type]}
          <p className="text-sm font-medium text-[var(--text-primary)] flex-1">
            {toast.message}
          </p>
          <button
            onClick={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
