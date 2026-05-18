# Category header photos

Drop a full-bleed header photo here, named by category slug:

- `escrita.jpg`  → Writing Instruments ("L'Art de l'Écriture")
- `isqueiros.jpg` → Lighters (optional, if you add `hero` for it)
- `pele.jpg` / `acessorios.jpg` → optional

Wire it by setting `hero: "/headers/<slug>.jpg"` on that category in
`lib/category-art.ts` (already set for `escrita`).

A dark gradient scrim is rendered over the photo and the title/eyebrow/
history are light, so text stays readable. If the file is missing the
header falls back to the dark navy monogram background (still looks fine).

Recommended: landscape, ~2000px wide, JPG/WebP.
