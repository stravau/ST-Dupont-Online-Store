import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Modern formats for product photography.
    formats: ["image/avif", "image/webp"],
    // When official imagery is served from a CDN (e.g. Cloudinary in Phase 3),
    // whitelist the host here. Local /public images need no entry.
    remotePatterns: [
      // { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
