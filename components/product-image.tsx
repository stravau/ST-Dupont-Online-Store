// Elegant deterministic placeholder until real product photography is supplied
// (Phase 3 / Cloudinary). Renders an on-brand SVG — no external requests.

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function ProductImage({
  seed,
  label,
  className = "",
}: {
  seed: string;
  label: string;
  className?: string;
}) {
  const h = hash(seed);
  const initials = label
    .replace(/^(Isqueiro|Caneta|Carteira|Porta-?|Esferográfica|Rollerball)\s*/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const rotation = (h % 12) - 6;

  return (
    <div className={`relative overflow-hidden bg-paper ${className}`}>
      <svg viewBox="0 0 400 480" className="h-full w-full" role="img" aria-label={label}>
        <defs>
          <linearGradient id={`g-${h}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e3ecf7" />
          </linearGradient>
          <pattern id={`p-${h}`} width="28" height="28" patternUnits="userSpaceOnUse" patternTransform={`rotate(${rotation})`}>
            <path d="M14 0 L28 14 L14 28 L0 14 Z" fill="none" stroke="#b58a34" strokeWidth="0.5" opacity="0.16" />
          </pattern>
        </defs>
        <rect width="400" height="480" fill={`url(#g-${h})`} />
        <rect width="400" height="480" fill={`url(#p-${h})`} />
        <rect x="28" y="28" width="344" height="424" fill="none" stroke="#b58a34" strokeWidth="1" opacity="0.45" />
        <text x="200" y="232" textAnchor="middle" fontFamily="Georgia, serif" fontSize="84" fill="#0a1a30" opacity="0.85">
          {initials || "S·T"}
        </text>
        <text x="200" y="270" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" letterSpacing="6" fill="#b58a34">
          S·T·DUPONT
        </text>
      </svg>
    </div>
  );
}
