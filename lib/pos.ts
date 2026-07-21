// In-store POS money + boutique helpers. VAT is 23% flat (Portuguese
// standard rate). The ECI concession fee is per-boutique: Lisboa runs
// on a 22% take, V. N. Gaia on 19%, per the two contracts on file.
// A rate change is a one-line edit to the map below.

export const VAT_DIVISOR = 1.23; // gross (w/ VAT) → net (ex-VAT)

export type BoutiqueCode = "LIS" | "VNG";

// ECI concession rate applied to NET sales, per boutique. Keep in
// sync with the underlying contracts — this is the authority for every
// report + POS calculation across the app.
export const ECI_COMMISSION_RATE: Record<BoutiqueCode, number> = {
  LIS: 0.22,
  VNG: 0.19,
};

const STAFF_ROLES = new Set(["ADMIN", "LOJA_LIS", "LOJA_VNG"]);

export function isStaffRole(role: string | null | undefined): boolean {
  return !!role && STAFF_ROLES.has(role);
}

// The store a staff login is bound to. LOJA_* are fixed to one boutique;
// ADMIN (the boss) is not — they must name the boutique per action.
export function boutiqueFromRole(role: string | null | undefined): BoutiqueCode | null {
  if (role === "LOJA_LIS") return "LIS";
  if (role === "LOJA_VNG") return "VNG";
  return null;
}

export function stockColumnFor(b: BoutiqueCode): "stockLis" | "stockVng" {
  return b === "LIS" ? "stockLis" : "stockVng";
}

// Line gross = qty · unit · (1 − discount). Net = gross / 1.23. Cents in, cents
// out (rounded once, at the end, to avoid drift across many lines).
export function lineGrossCents(quantity: number, unitPriceCents: number, discountPct: number): number {
  return Math.round(quantity * unitPriceCents * (1 - discountPct));
}

export function netFromGross(grossCents: number): number {
  return Math.round(grossCents / VAT_DIVISOR);
}

export function eciCommissionCents(netCents: number, boutique: BoutiqueCode): number {
  return Math.round(netCents * ECI_COMMISSION_RATE[boutique]);
}

export function eciCommissionPct(boutique: BoutiqueCode): number {
  return ECI_COMMISSION_RATE[boutique];
}
