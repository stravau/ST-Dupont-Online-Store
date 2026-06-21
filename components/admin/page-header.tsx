// Shared page header for /admin/* pages — eyebrow + serif title +
// optional subtitle + slot for a primary action (button / link) on
// the right. Keeps every panel page on the same rhythm.
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-6">
      <div>
        {eyebrow && (
          <p className="overline text-[0.55rem] tracking-[0.22em] text-gold">{eyebrow}</p>
        )}
        <h1 className="mt-2 font-serif text-3xl text-ink">{title}</h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-3">{action}</div>}
    </header>
  );
}
