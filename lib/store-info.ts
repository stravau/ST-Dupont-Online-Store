// Single source of truth for the boutique contact details + map links.
// Two boutiques: El Corte Inglés Lisboa (STORE_LIS) and El Corte Inglés
// Vila Nova de Gaia (STORE_VNG). `STORE` remains exported as the
// default (Lisboa) so legacy call-sites keep working; new code should
// prefer STORES (the ordered pair) or the individual constants.

export interface StoreInfo {
  key: "lis" | "vng";
  venue: string;
  street: string;
  postcode: string;
  city: string;
  phone: string;
  phoneHref: string;
  email: string;
  officialUrl: string;
  officialLabel: string;
  coords: { lat: number; lng: number };
  heroImage: string;         // full-bleed hero for the loja hub
  mallImage: string;         // wide photo used on cards, etc.
  contactAnchor: string;     // #contacto-lis, #contacto-vng
  mapEmbedSrc: string;
  mapDirectionsUrl: string;
  labels: { pt: { name: string; short: string }; en: { name: string; short: string } };
}

function build(base: Omit<StoreInfo, "mapEmbedSrc" | "mapDirectionsUrl">): StoreInfo {
  const c = `${base.coords.lat},${base.coords.lng}`;
  return {
    ...base,
    mapEmbedSrc: `https://www.google.com/maps?q=${c}&z=17&output=embed`,
    mapDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${c}`,
  };
}

export const STORE_LIS: StoreInfo = build({
  key: "lis",
  venue: "El Corte Inglés — Lisboa",
  street: "Av. António Augusto de Aguiar, 31",
  postcode: "1050-012 Lisboa, Portugal",
  city: "Lisboa",
  phone: "+351 925 594 050",
  phoneHref: "tel:+351925594050",
  email: "stdupont_eci_lx@starbrands.pt",
  officialUrl: "https://www.st-dupont.com",
  officialLabel: "st-dupont.com",
  coords: { lat: 38.73386, lng: -9.15351 },
  heroImage: "/store/eci-mall.jpg",
  mallImage: "/store/eci-mall.jpg",
  contactAnchor: "contacto-lis",
  labels: {
    pt: { name: "Boutique Lisboa", short: "Lisboa" },
    en: { name: "Lisbon Boutique",  short: "Lisbon"  },
  },
});

export const STORE_VNG: StoreInfo = build({
  key: "vng",
  venue: "El Corte Inglés — Vila Nova de Gaia",
  street: "Av. da República, 1435",
  postcode: "4430-999 Vila Nova de Gaia, Portugal",
  city: "Vila Nova de Gaia",
  phone: "+351 919 800 300",
  phoneHref: "tel:+351919800300",
  email: "vng@starbrands.pt",
  officialUrl: "https://www.st-dupont.com",
  officialLabel: "st-dupont.com",
  coords: { lat: 41.13094, lng: -8.60738 },
  // Reuse the ECI hero until a Gaia-specific photo lands under
  // /public/store/eci-gaia.jpg. Swap the paths when the asset ships.
  heroImage: "/store/eci-gaia.jpg",
  mallImage: "/store/eci-gaia.jpg",
  contactAnchor: "contacto-vng",
  labels: {
    pt: { name: "Boutique V. N. de Gaia", short: "V. N. de Gaia" },
    en: { name: "V. N. Gaia Boutique",     short: "V. N. Gaia"    },
  },
});

// Ordered pair — Lisboa first, Gaia second. Used by /loja to lay
// out the two-column hero and the two detail blocks.
export const STORES: readonly StoreInfo[] = [STORE_LIS, STORE_VNG];

// ---- Legacy default ---------------------------------------------------
// Kept for existing importers of STORE (footer, PDP inquiry, seed data
// legal entity, …). Points at the Lisboa boutique which is the primary
// contact channel the site was built around.
export const STORE = STORE_LIS;
export const STORE_COORDS = STORE_LIS.coords;
export const mapsEmbedSrc = STORE_LIS.mapEmbedSrc;
export const mapsDirectionsUrl = STORE_LIS.mapDirectionsUrl;
export const CONTACT_ANCHOR = STORE_LIS.contactAnchor;

// Operator legal entity — surfaced in the legal pages. The email
// domain suggests Starbrands is the local distributor for both
// boutiques. Update with the real legal entity / company number /
// registered address before launch.
export const LEGAL_ENTITY = {
  pt: "Starbrands, S.A. (operadora local das boutiques S.T. Dupont em Portugal)",
  en: "Starbrands, S.A. (local operator of the S.T. Dupont boutiques in Portugal)",
} as const;

// Flip to true to surface the yellow "Draft document" banner on every
// legal page while the text is still under legal review.
export const LEGAL_IS_DRAFT = false;
