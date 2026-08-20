import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // TRAVÃO DE EMERGÊNCIA (19/08/2026): a quota de optimização de imagem da
    // Vercel esgotou-se e o /_next/image passou a responder 402 Payment
    // Required a TUDO — o site ficou sem uma única fotografia. Os ficheiros
    // estavam bons (o /products/*.webp servia 200); era só o optimizador.
    //
    // Com isto as imagens são servidas tal como estão, sem passar por lá.
    // O custo é o peso: os webp locais são quase todos < 200 KB e não se
    // nota, mas as ~2069 fotos que ainda vêm do CDN da Starbrands são JPEG
    // de ~1 MB e vão pesar no telemóvel.
    //
    // PARA REVERTER, quando a quota renovar ou o plano subir: apagar esta
    // linha. A correcção de fundo é descarregar as fotos do CDN para
    // public/products/ em webp, como já está feito para as outras 2281 —
    // aí o peso deixa de ser problema mesmo sem optimizador.
    unoptimized: true,
    // Modern formats for product photography — Vercel Image Optimization
    // negociateia AVIF/WebP automaticamente e cachea no edge (~30d).
    formats: ["image/avif", "image/webp"],
    // Larguras que o optimizador pode gerar. Sem isto o Next usa as
    // predefinidas — 8 de ecrã e 8 de elemento — e cada fotografia rende mais
    // de dez transformações distintas. A Vercel cobra por combinação única de
    // imagem e largura, e com ~4350 fotos no catálogo foi assim que a quota se
    // esgotou em Agosto de 2026.
    //
    // O tecto é 2048 porque é esse o tamanho das fotos de origem (o CDN da
    // Starbrands serve 2048×2048, os webp locais 1280×1280). Pedir 3840, como
    // a predefinição faz, nunca devolvia mais pixels — só gastava quota.
    //
    // Não há perda de qualidade em nenhum ponto: o Next escolhe sempre a
    // largura disponível mais próxima ACIMA da necessária, portanto tirar
    // valores intermédios só faz servir uma imagem ligeiramente maior. Os
    // casos extremos foram conferidos — o cartão de catálogo a 22vw num ecrã
    // de 1440 com DPR 2 precisa de 634px e continua a receber 640.
    deviceSizes: [640, 1280, 2048],
    imageSizes: [64, 128, 256, 384],
    // Hosts externos permitidos. images.starbrands.pt é o CDN oficial da
    // Starbrands (dona da loja e da marca dos produtos) — é a fonte da
    // verdade das fotos de catálogo, referenciada directamente no
    // ProductVariant.images. O Next.js busca uma vez, converte para
    // AVIF/WebP no tamanho pedido pelo browser, e serve do edge.
    remotePatterns: [
      { protocol: "https", hostname: "images.starbrands.pt" },
      // Vercel Blob — onde aterra tudo o que for carregado pelo admin (fotos
      // de variante, fundo do "Em Destaque"). Sem isto, o dia em que o
      // optimizador voltar a ser ligado, essas imagens passavam a dar erro:
      // o next/image recusa hosts que nao estejam nesta lista. O fundo em si
      // entra por CSS e nao passa por aqui, mas as fotos de produto sim.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
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
