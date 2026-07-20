import Link from "next/link";
import { redirect } from "next/navigation";
import { currentStaff } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { IconList, IconUpload, IconChevronRight } from "@/components/admin/icons";
import { SalesPulse, SalesTrend } from "@/components/admin/dashboard-widgets";
import { salesByStore, dailySalesSeries, dayWindow, monthWindow } from "@/lib/pos-reports";
import type { BoutiqueCode } from "@/lib/pos";

export const dynamic = "force-dynamic";

function JumpCard({ href, eyebrow, title, body, Icon }: { href: string; eyebrow: string; title: string; body: string; Icon: (p: { className?: string }) => React.ReactElement }) {
  return (
    <Link href={href} className="group flex items-start justify-between gap-5 border border-line bg-paper p-7 transition-colors hover:border-gold">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center border border-line text-gold transition-colors group-hover:border-gold group-hover:bg-gold/10">
            <Icon className="h-4 w-4" />
          </span>
          <p className="overline text-[0.55rem] text-gold">{eyebrow}</p>
        </div>
        <h2 className="mt-4 font-serif text-2xl text-ink">{title}</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">{body}</p>
      </div>
      <IconChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-gold" />
    </Link>
  );
}

export default async function AdminHome() {
  // The dashboard is the boss's cross-store overview — store logins land on
  // Registar Venda instead. Role read from the DB so it's not fooled by a
  // stale session minted before the account was changed to a store login.
  const staff = await currentStaff();
  if (staff?.role !== "ADMIN") redirect("/admin/pos");

  // Personalised greeting — first name of the logged-in boss.
  const me = staff.email
    ? await prisma.user.findUnique({ where: { email: staff.email }, select: { name: true } })
    : null;
  const firstName = me?.name?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Bem-vindo, ${firstName}!` : "Bem-vindo!";

  // Business pulse — boss sees both boutiques. Today + this-month + a 30-day trend.
  const now = new Date();
  const today = dayWindow(now);
  const month = monthWindow(now);
  const trendFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
  const BOTH: BoutiqueCode[] = ["LIS", "VNG"];
  const monthName = now.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });

  const [recentActions, todayStores, monthStores, trend] = await Promise.all([
    prisma.adminAction.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { email: true } } },
    }),
    salesByStore(BOTH, today.from, today.to),
    salesByStore(BOTH, month.from, month.to),
    dailySalesSeries(BOTH, trendFrom, today.to),
  ]);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Painel"
        title={greeting}
        subtitle="Resumo da Maison — vendas ao vivo, tendência e o estado do catálogo."
      />

      {/* Business pulse — the first thing the boss sees: how are sales doing? */}
      <SalesPulse today={todayStores} month={monthStores} monthName={monthName} />
      <SalesTrend points={trend} />

      <section className="grid gap-5 md:grid-cols-2">
        <JumpCard
          href="/admin/variants"
          eyebrow="Artigos"
          title="Lista editável"
          body="Pesquisa, filtra e edita em direto EAN, REF, PVP, status, stock e imagens por variant."
          Icon={IconList}
        />
        <JumpCard
          href="/admin/uploads"
          eyebrow="Uploads"
          title="Excel batch"
          body="PVP · Promoções · Stock · Novos artigos. Aplica directamente na DB com trilho de auditoria."
          Icon={IconUpload}
        />
      </section>

      <section>
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <h2 className="font-serif text-xl text-ink">Últimas alterações</h2>
          <Link href="/admin/audit" className="text-[0.6rem] tracking-[0.18em] text-muted uppercase transition-colors hover:text-gold">
            Ver tudo →
          </Link>
        </div>
        <div className="border border-line border-t-0 bg-paper">
          {recentActions.length === 0 ? (
            <EmptyState
              icon="✦"
              title="Sem actividade ainda"
              body="As edições no painel e os uploads aparecem aqui em tempo real."
            />
          ) : (
            <ul className="divide-y divide-line/70">
              {recentActions.map((a) => (
                <li key={a.id} className="grid grid-cols-[auto_auto_1fr_auto] items-baseline gap-4 px-5 py-3 text-sm">
                  <time className="text-xs text-muted tabular-nums">
                    {a.createdAt.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}
                  </time>
                  <span className="text-[0.6rem] tracking-[0.18em] text-gold uppercase">{a.action}</span>
                  <span className="truncate text-xs text-ink">
                    <span className="font-mono text-muted">{a.entityType}</span>
                    {a.entityId ? <> · <span className="font-mono">{a.entityId}</span></> : null}
                    {a.note ? <span className="text-muted"> · {a.note}</span> : null}
                  </span>
                  <span className="text-[0.65rem] text-muted">{a.user?.email ?? "system"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
