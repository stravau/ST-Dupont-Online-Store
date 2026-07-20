"use client";

import { useEffect } from "react";

// The root layout owns <html> and can't know the active locale (it sits above
// the [lang] segment), so it hardcodes lang="pt". This corrects the document
// language to the active locale on the client, so /en pages report lang="en"
// to assistive tech and crawlers (which execute JS). Renders nothing.
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
