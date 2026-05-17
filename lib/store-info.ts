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

const MAPS_QUERY =
  "El Corte Inglés Lisboa, Av. António Augusto de Aguiar 31, 1050-012 Lisboa";

// Keyless Google Maps embed (no API key required) + a directions deep link.
export const mapsEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
  MAPS_QUERY,
)}&z=16&output=embed`;

export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  MAPS_QUERY,
)}`;

// Stable id for the footer contact block (Need help? anchors here).
export const CONTACT_ANCHOR = "contacto";
