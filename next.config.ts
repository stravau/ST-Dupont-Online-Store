import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Modern formats for product photography — Vercel Image Optimization
    // negociateia AVIF/WebP automaticamente e cachea no edge (~30d).
    formats: ["image/avif", "image/webp"],
    // Hosts externos permitidos. images.starbrands.pt é o CDN oficial da
    // Starbrands (dona da loja e da marca dos produtos) — é a fonte da
    // verdade das fotos de catálogo, referenciada directamente no
    // ProductVariant.images. O Next.js busca uma vez, converte para
    // AVIF/WebP no tamanho pedido pelo browser, e serve do edge.
    remotePatterns: [
      { protocol: "https", hostname: "images.starbrands.pt" },
    ],
  },
  // Baseline security headers for every route. Deliberately NOT a strict
  // Content-Security-Policy (that needs per-route auditing of inline
  // styles/scripts and would risk breaking the storefront) — these are the
  // safe, high-value headers. frame-ancestors 'none' + X-Frame-Options stop
  // clickjacking (the admin is especially sensitive); HSTS is safe on Vercel
  // (HTTPS-only).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
