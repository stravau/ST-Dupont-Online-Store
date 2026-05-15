# Official product photography — drop zone

Place **official** S.T. Dupont product images here, supplied through the
brand / authorized supplier asset feed. Do NOT scrape them from
st-dupont.com (copyright + site terms).

## Naming & wiring

Name each file by the product `slug` used in `lib/catalog.ts`, e.g.:

- `ligne-2.jpg`
- `line-d-eternity.jpg`
- `apex-wallet.jpg`

Then set the matching `image` field in `lib/catalog.ts`:

```ts
{ slug: "ligne-2", /* ... */ image: "/products/ligne-2.jpg" }
```

`components/product-media.tsx` automatically uses the photo when `image`
is set, and the on-brand SVG placeholder when it is `null`. No component
changes required — just add the file and set the path.

Recommended: ~1200×1440px (5:6), neutral/transparent background, AVIF/WebP
or high-quality JPG. `next/image` re-encodes to AVIF/WebP at serve time.
