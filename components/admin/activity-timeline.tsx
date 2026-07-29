import Link from "next/link";
import type { AdminAction, User } from "@/app/generated/prisma/client";

// ActivityTimeline — substitui a lista chata de <li> por uma timeline
// com ícones semânticos + timestamps relativos ("há 2 min", "há 1 h").
// Server component: recebe as AdminAction já com o user included.
//
// Cor do ícone via semânticas Maison (emerald/copper/claret/muted/gold)
// dependendo do tipo de action, para o patrão perceber num scan visual
// se o feed é maioritariamente positivo (vendas), operacional (syncs) ou
// de correcção (deletes).

type ActionRow = AdminAction & { user: Pick<User, "email"> | null };

// Mapeamento entityType/action → (ícone SVG path, cor semântica).
function iconFor(a: ActionRow): { d: string; tone: string; bg: string } {
  const t = a.entityType;
  const act = a.action;
  // Sales & POS
  if (t === "SALE" || t === "SALE_ITEM") {
    // shopping bag
    return {
      d: "M6 4h12l-1 4H7L6 4Zm0 4h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8Zm3 4v4m6-4v4",
      tone: "text-emerald",
      bg: "bg-emerald/10 border-emerald/30",
    };
  }
  if (t === "UPLOAD_BATCH" || act === "SYNC_ECI") {
    // arrow-down-circle (sync)
    return {
      d: "M12 3v12m0 0-4-4m4 4 4-4M4 21h16",
      tone: "text-copper",
      bg: "bg-copper/10 border-copper/30",
    };
  }
  if (t === "STOCK_MOVEMENT" || t === "OTHER_BRAND_STOCK") {
    // box
    return {
      d: "M4 8l8-4 8 4v8l-8 4-8-4V8Zm0 0 8 4m8-4-8 4m0 0v8",
      tone: "text-gold",
      bg: "bg-gold/10 border-gold/30",
    };
  }
  if (t === "REPAIR") {
    // wrench
    return {
      d: "M14 6l4 4-8 8-4-4 8-8Zm0 0 3-3a3 3 0 1 1 3 3l-3 3",
      tone: "text-copper",
      bg: "bg-copper/10 border-copper/30",
    };
  }
  if (t === "VARIANT" || t === "VARIANT_BULK" || t === "OTHER_BRAND_ITEM" || t === "OTHER_BRAND_BULK") {
    // pencil
    return {
      d: "M4 20h4l10-10-4-4L4 16v4Zm12-12 2-2",
      tone: "text-muted",
      bg: "bg-line/40 border-line",
    };
  }
  if (act === "DELETE") {
    return {
      d: "M6 7h12M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M8 7l1 12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2l1-12",
      tone: "text-claret",
      bg: "bg-claret/10 border-claret/30",
    };
  }
  // fallback — dot generic
  return {
    d: "M12 8v.01M12 12v.01M12 16v.01",
    tone: "text-muted",
    bg: "bg-line/40 border-line",
  };
}

function relativeTime(d: Date): string {
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60) return `há ${Math.max(1, diff)}s`;
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 7) return `há ${Math.floor(diff / 86400)} d`;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

export function ActivityTimeline({ actions }: { actions: ActionRow[] }) {
  return (
    <section className="border border-line bg-paper p-5">
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <h2 className="font-serif text-xl text-ink">Actividade recente</h2>
        <Link
          href="/admin/audit"
          className="text-[0.6rem] tracking-[0.18em] text-muted uppercase transition-colors hover:text-gold"
        >
          Ver tudo →
        </Link>
      </div>

      {actions.length === 0 ? (
        <p className="mt-6 text-center text-sm text-muted">
          Sem actividade ainda — as edições no painel e os uploads aparecem aqui.
        </p>
      ) : (
        <ol className="mt-4 space-y-2">
          {actions.map((a) => {
            const ico = iconFor(a);
            return (
              <li
                key={a.id}
                className="grid grid-cols-[36px_1fr_auto] items-start gap-3 rounded-sm px-2 py-2 transition-colors hover:bg-cream/40"
              >
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${ico.bg}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={ico.tone}>
                    <path d={ico.d} />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm text-ink">
                    <span className="text-[0.6rem] tracking-[0.16em] text-gold uppercase">
                      {a.action}
                    </span>
                    <span className="font-mono text-[0.7rem] text-muted">
                      {a.entityType}
                      {a.entityId ? <> · {a.entityId}</> : null}
                    </span>
                  </p>
                  {a.note && (
                    <p className="mt-0.5 truncate text-[0.72rem] text-muted">{a.note}</p>
                  )}
                </div>
                <div className="text-right text-[0.65rem] text-muted">
                  <p className="tabular-nums">{relativeTime(a.createdAt)}</p>
                  <p className="mt-0.5 truncate">{a.user?.email?.split("@")[0] ?? "system"}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
