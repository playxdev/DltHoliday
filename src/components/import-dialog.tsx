"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileSpreadsheet, X, Check, AlertTriangle } from "lucide-react";

interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
}

interface ImportDialogProps {
  onClose: () => void;
  onImported: () => void;
}

export default function ImportDialog({ onClose, onImported }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [replaceAll, setReplaceAll] = useState(true);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    const name = f.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".xls") && !name.endsWith(".xlsx")) {
      return;
    }
    setFile(f);
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFile(e.dataTransfer.files[0] || null);
    },
    [handleFile]
  );

  const handleImport = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("replaceAll", String(replaceAll));

    try {
      const res = await fetch("/api/holidays/import", {
        method: "POST",
        body: formData,
      });
      const data: ImportResult = await res.json();
      setResult(data);
      if (data.imported > 0) {
        onImported();
      }
    } catch {
      setResult({
        success: false,
        total: 0,
        imported: 0,
        skipped: 0,
        errors: ["Network error — failed to upload file"],
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content !max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Import Holidays
          </h3>
          <button onClick={onClose} className="nav-icon-btn">
            <X size={18} />
          </button>
        </div>

        {!result ? (
          <>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Upload a CSV or Excel (.xls/.xlsx) file. Expected columns:{" "}
              <code className="text-xs bg-[var(--bg-hover)] px-1.5 py-0.5 rounded">
                holiday_name
              </code>
              ,{" "}
              <code className="text-xs bg-[var(--bg-hover)] px-1.5 py-0.5 rounded">
                holiday_date
              </code>
              ,{" "}
              <code className="text-xs bg-[var(--bg-hover)] px-1.5 py-0.5 rounded">
                active_status
              </code>{" "}
              (optional).
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
                ${dragOver
                  ? "border-[var(--accent)] bg-[var(--accent-light)]"
                  : "border-[var(--border)] hover:border-[var(--text-muted)]"}`}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
              />

              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileSpreadsheet size={36} className="text-[var(--accent)]" />
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {file.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--danger)] mt-1"
                  >
                    Remove &amp; choose another
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={36} className="text-[var(--text-muted)]" />
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Drop file here or click to browse
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    CSV, .xls, .xlsx supported
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceAll}
                  onChange={(e) => setReplaceAll(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border)] accent-[var(--accent)]
                    bg-[var(--bg-input)] focus:ring-2 focus:ring-[var(--accent-light)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">
                  Replace all existing holidays before import
                </span>
              </label>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || uploading}
                className="btn btn-primary"
              >
                {uploading ? (
                  <>
                    <svg className="spinner w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Start Import
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={`p-4 rounded-lg mb-4 ${result.success ? "bg-[var(--success-bg)]" : "bg-[var(--warning-bg)]"}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                  <Check size={18} className="text-[var(--success-text)]" />
                ) : (
                  <AlertTriangle size={18} className="text-[var(--warning-text)]" />
                )}
                <span className={`text-sm font-semibold ${result.success ? "text-[var(--success-text)]" : "text-[var(--warning-text)]"}`}>
                  {result.success ? "Import Complete" : "Import Finished with Issues"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{result.total}</p>
                  <p className="text-xs text-[var(--text-muted)]">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--success-text)]">{result.imported}</p>
                  <p className="text-xs text-[var(--text-muted)]">Imported</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--danger)]">{result.skipped}</p>
                  <p className="text-xs text-[var(--text-muted)]">Skipped</p>
                </div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase">
                  Errors ({result.errors.length})
                </p>
                <div className="max-h-32 overflow-y-auto rounded-lg border border-[var(--border)] p-2 bg-[var(--bg-hover)]">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-[var(--danger)] py-0.5">
                      {err}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                }}
                className="btn btn-secondary"
              >
                Import Another
              </button>
              <button onClick={onClose} className="btn btn-primary">
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
