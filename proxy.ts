import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

// Redirect any path missing a locale prefix to a locale-prefixed path,
// preferring the visitor's Accept-Language when it matches a supported one.
// (Next 16 `proxy` convention — replaces the deprecated `middleware`.)
function resolveLocale(req: NextRequest): string {
  const header = req.headers.get("accept-language") ?? "";
  const preferred = header.split(",").map((p) => p.split(";")[0].trim().slice(0, 2).toLowerCase());
  return preferred.find((l) => (locales as readonly string[]).includes(l)) ?? defaultLocale;
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
  // Skip Next internals, API, and files with an extension (assets).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
