# Official S.T. Dupont brand assets — drop zone

Place the **official** logo files supplied through S.T. Dupont's brand /
B2B asset channel here. Do NOT scrape them from st-dupont.com — that
breaches copyright and the site terms.

Expected files:

- `logo.svg` — primary horizontal wordmark/logotype (preferred: vector SVG)
- `logo-mark.svg` — emblem/monogram only (optional, for compact spaces)
- `favicon.ico` / `icon.png` — if brand-provided

## Wiring it in (no other code change needed)

Once `logo.svg` is here, replace the text wordmark in
`components/site-header.tsx` (the `<Link href={/${lang}}>` block) and the
footer wordmark in `components/site-footer.tsx` with:

```tsx
import Image from "next/image";
<Image src="/brand/logo.svg" alt="S.T. Dupont" width={180} height={28} priority />
```

Until then, a styled text wordmark stands in.
