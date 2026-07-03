interface StatCardProps {
  title: string;
  value: number;
  description?: string;
  icon: React.ReactNode;
}

export default function StatCard({
  title,
  value,
  description,
  icon,
}: StatCardProps) {
  return (
    <div
      className="rounded-xl shadow-sm border p-5
        bg-[var(--bg-surface)] border-[var(--border)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
            {value.toLocaleString()}
          </p>
          {description && (
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {description}
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-[var(--accent-light)] text-[var(--accent)]">
          {icon}
        </div>
      </div>
    </div>
  );
}
