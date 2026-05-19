"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Wraps the page body in a div keyed on the pathname so React re-mounts
// the subtree on every navigation — the `.page-transition` CSS animation
// then replays, giving each new page a distinct fade-up entry.
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
