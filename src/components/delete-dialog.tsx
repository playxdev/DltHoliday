"use client";

interface DeleteDialogProps {
  holidayName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteDialog({
  holidayName,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteDialogProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Deactivate Holiday
        </h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Are you sure you want to deactivate{" "}
          <span className="font-semibold text-[var(--text-primary)]">
            &ldquo;{holidayName}&rdquo;
          </span>
          ? It will still exist in the database but will be marked as inactive.
        </p>
        <div className="mt-5 flex items-center gap-3 justify-end">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            disabled={isDeleting}
            className="btn btn-danger"
          >
            {isDeleting ? "Deactivating..." : "Yes, Deactivate"}
          </button>
        </div>
      </div>
    </div>
  );
}
