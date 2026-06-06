// Mailto-based inquiry / consultation requests. No DB or SMTP needed —
// emails land directly in the boutique inbox. Templated subject/body
// strings come from the i18n dictionary (PT/EN) and are filled per
// variant on the client / server.

export const INQUIRY_TO = "stdupont_eci_lx@starbrands.pt";

type Data = { title?: string; sku?: string; color?: string; size?: string; ref?: string };

function fill(s: string, data: Data): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => (data as Record<string, string | undefined>)[k] ?? "");
}

export function inquiryMailto(opts: {
  subject: string; // template with {title} {sku} {color} {size} {ref}
  body: string;
  data: Data;
  to?: string;
}): string {
  const to = opts.to ?? INQUIRY_TO;
  const subject = encodeURIComponent(fill(opts.subject, opts.data));
  const body = encodeURIComponent(fill(opts.body, opts.data));
  return `mailto:${to}?subject=${subject}&body=${body}`;
}
