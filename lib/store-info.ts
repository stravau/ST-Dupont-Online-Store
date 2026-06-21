// Single source of truth for the boutique's contact details and map links.
// Used by the footer, the home boutique teaser and the store page.

export const STORE = {
  venue: "El Corte Inglés — Lisboa",
  street: "Av. António Augusto de Aguiar, 31",
  postcode: "1050-012 Lisboa, Portugal",
  city: "Lisboa",
  phone: "+351 925 594 050",
  phoneHref: "tel:+351925594050",
  email: "stdupont_eci_lx@starbrands.pt",
  officialUrl: "https://www.st-dupont.com",
  officialLabel: "st-dupont.com",
} as const;

// Operator legal entity — surfaced in the legal pages. The email domain
// suggests Starbrands is the local distributor. Update with the real
// legal entity / company number / registered address before launch.
export const LEGAL_ENTITY = {
  pt: "Starbrands, S.A. (operadora local da boutique S.T. Dupont · El Corte Inglés Lisboa)",
  en: "Starbrands, S.A. (local operator of the S.T. Dupont boutique · El Corte Inglés Lisbon)",
} as const;

// Flip to true to surface the yellow "Draft document" banner on every
// legal page while the text is still under legal review.
export const LEGAL_IS_DRAFT = false;

// Precise coordinates of El Corte Inglés Lisboa (Av. António Augusto de
// Aguiar 31) — exact pin instead of a fuzzy address text query.
export const STORE_COORDS = { lat: 38.73386, lng: -9.15351 } as const;
const COORDS = `${STORE_COORDS.lat},${STORE_COORDS.lng}`;

// Keyless Google Maps embed (no API key required) + a directions deep link.
export const mapsEmbedSrc = `https://www.google.com/maps?q=${COORDS}&z=17&output=embed`;

export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${COORDS}`;

// Stable id for the footer contact block (Need help? anchors here).
export const CONTACT_ANCHOR = "contacto";
