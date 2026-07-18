// In-store POS money + boutique helpers. The two factors below come straight
// from the ECI control Excel: net = gross / 1.23 (Portuguese VAT 23%), and the
// El Corte Inglés concession fee = net * 0.19. Kept here so a rate change is a
// one-line edit that every report and the sale endpoint pick up.

export const VAT_DIVISOR = 1.23; // gross (w/ VAT) → net (ex-VAT)
export const ECI_COMMISSION_RATE = 0.19; // ECI concession fee on net sales

export type BoutiqueCode = "LIS" | "VNG";

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

export function eciCommissionCents(netCents: number): number {
  return Math.round(netCents * ECI_COMMISSION_RATE);
}
