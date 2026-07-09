import { PageLoader } from "@/components/page-loader";

// Shown for every route under /[lang] while its page segment streams in.
// The layout (header + footer) stays; only the content area shows the loader.
export default function Loading() {
  return <PageLoader />;
}
