// Compact status indicator — dot + tracked label. Three semantic tones:
//   DISPONIVEL    → green (in stock / live)
//   INDISPONIVEL  → amber (visible on site but flagged)
//   DESCONTINUADO → grey  (hidden from site)
export function StatusPill({ status, size = "sm" }: { status: "DISPONIVEL" | "INDISPONIVEL" | "DESCONTINUADO"; size?: "sm" | "md" }) {
  const tone =
    status === "DISPONIVEL"    ? { dot: "bg-[#2bb673]",  text: "text-[#1f7a4d]", bg: "bg-[#2bb673]/8" } :
    status === "INDISPONIVEL"  ? { dot: "bg-[#d4a017]",  text: "text-[#7e5e00]", bg: "bg-[#d4a017]/10" } :
                                  { dot: "bg-[#8b95a6]", text: "text-[#4a5466]", bg: "bg-[#8b95a6]/10" };
  const label =
    status === "DISPONIVEL"   ? "Disponível"   :
    status === "INDISPONIVEL" ? "Indisponível" :
                                 "Descontinuado";
  const pad = size === "md" ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[0.65rem]";
  return (
    <span className={`inline-flex items-center gap-1.5 ${pad} ${tone.bg} ${tone.text} tracking-[0.14em] uppercase`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {label}
    </span>
  );
}
