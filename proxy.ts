import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";
import { auth } from "@/auth";

// Next 16 `proxy` convention — replaces the deprecated `middleware`.
// Two concerns interleaved here, in order:
//
//   1. /admin/*  + /api/admin/*  → require an authenticated ADMIN
//                                    session, otherwise redirect to
//                                    /admin/login. /admin/login itself
//                                    stays open so users can sign in.
//   2. All other site routes      → redirect to a locale-prefixed path
//                                    using Accept-Language as the hint.
function resolveLocale(req: NextRequest): string {
  const header = req.headers.get("accept-language") ?? "";
  const preferred = header.split(",").map((p) => p.split(";")[0].trim().slice(0, 2).toLowerCase());
  return preferred.find((l) => (locales as readonly string[]).includes(l)) ?? defaultLocale;
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ---- Admin gate ----
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const isLogin = pathname === "/admin/login";
    if (isLogin) return NextResponse.next();
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    // ADMIN gets everything; LOJA_LIS / LOJA_VNG can access the panel
    // to maintain their own boutique stock column (field-level gating
    // lives in the per-route handlers).
    const allowed = role === "ADMIN" || role === "LOJA_LIS" || role === "LOJA_VNG";
    if (!allowed) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ---- Locale redirect ----
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = resolveLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Include /admin/* + /api/admin/* in the matcher (they were previously
  // excluded by the /api skip). Static assets and Next internals still
  // skip out.
  matcher: ["/((?!_next|api/(?!admin)|.*\\..*).*)", "/api/admin/:path*"],
};
