// Cache-bust token for product imagery. Bump when re-cropped/replaced so
// browsers and the Next/Vercel image optimizer fetch the new file even
// though the path is unchanged.
export const IMG_VERSION = "20260518";

export function imgSrc(src: string | null | undefined): string | null {
  if (!src) return null;
  return src.includes("?") ? `${src}&v=${IMG_VERSION}` : `${src}?v=${IMG_VERSION}`;
}
