// Generic "nothing here yet" panel used across admin pages — keeps the
// blank-result moments quiet and on-brand rather than a bare line of
// text floating in a table cell.
export function EmptyState({
  icon = "✦",
  title,
  body,
  action,
}: {
  icon?: string;
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <span aria-hidden className="text-3xl text-gold">{icon}</span>
      <h3 className="font-serif text-xl text-ink">{title}</h3>
      {body && <p className="text-sm text-muted">{body}</p>}
      {action}
    </div>
  );
}
