// Hand-rolled inline icons — no library dependency, all 1.5 stroke
// width for a consistent luxe-line feel matched to the public site.
// Each icon accepts a className so callers can swap colour / size.

const stroke = (props: { className?: string }) => ({
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: props.className ?? "h-4 w-4",
});

export function IconDashboard(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke(props)}>
      <rect x="3"  y="3"  width="7" height="9" />
      <rect x="14" y="3"  width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3"  y="16" width="7" height="5" />
    </svg>
  );
}

export function IconList(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke(props)}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function IconUpload(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke(props)}>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

export function IconPos(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke(props)}>
      <path d="M4 6v12M7.5 6v12M11 6v12M14 6v12M17 6v12M20 6v12" />
    </svg>
  );
}

export function IconReports(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke(props)}>
      <path d="M4 20h16" />
      <path d="M7 20v-6M12 20V8M17 20v-9" />
    </svg>
  );
}

export function IconCalendar(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke(props)}>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </svg>
  );
}

export function IconAudit(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke(props)}>
      <path d="M9 4h7l4 4v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M15 4v5h5" />
      <path d="M11 13h6M11 17h6" />
    </svg>
  );
}

export function IconSearch(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function IconSignOut(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke(props)}>
      <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M15 12H5" />
    </svg>
  );
}

export function IconChevronRight(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...stroke(props)}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
