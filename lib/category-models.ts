// Curated model line-up per category — drives the horizontal hero slider on
// each /c/[category] page. Each entry is one of the brand's signature model
// LINES (Ligne 2, Apex, …), not every collection in the catalogue. Order
// matches the way the Maison presents the line-up on st-dupont.com.
//
// `cols` is the list of `collection` strings stored on Product rows that
// belong to this model line — most entries are a single collection, but
// some lines bundle multiple SKUs (Jet = Maxijet + Minijet) and we want
// the slider to surface them under one thumbnail.
//
// `themeHref` is set when a model lives under a cross-category theme route
// (/colecao/<theme>) rather than the per-category ?col= filter. Used for
// Cohiba / Monogram in lighters and elsewhere.
//
// The slider resolver picks one representative product per model (first
// hit in `cols`) and uses its primary image as the thumbnail. No design
// asset to author — the model card image always reflects whatever's in
// the catalogue right now.

import type { Locale } from "@/lib/i18n";

export type L = Record<Locale, string>;

const t = (pt: string, en: string): L => ({ pt, en });

export interface ModelEntry {
  key: string;          // stable id used by the resolver to bucket products
  label: L;
  cols: string[];       // collection names whose products belong to this model
  themeHref?: string;   // for /colecao/<theme> routes; takes precedence over col-filter href
}

export const categoryModels: Record<string, ModelEntry[]> = {
  isqueiros: [
    { key: "ligne-1", label: t("Ligne 1", "Ligne 1"), cols: ["Ligne 1"] },
    { key: "ligne-2", label: t("Ligne 2", "Ligne 2"), cols: ["Ligne 2"] },
    { key: "le-grand-dupont", label: t("Le Grand Dupont", "Le Grand Dupont"), cols: ["Le Grand Dupont"] },
    { key: "initial", label: t("Initial", "Initial"), cols: ["Initial"] },
    { key: "biggy", label: t("Biggy", "Biggy"), cols: ["Biggy"] },
    { key: "slimmy", label: t("Slimmy", "Slimmy"), cols: ["Slimmy"] },
    { key: "twiggy", label: t("Twiggy", "Twiggy"), cols: ["Twiggy"] },
    { key: "jet", label: t("Jet", "Jet"), cols: ["Maxijet", "Minijet"] },
    { key: "slim-7", label: t("Slim 7", "Slim 7"), cols: ["Slim 7"] },
    { key: "windproof", label: t("Windproof", "Windproof"), cols: ["Défi Extreme", "Windproof"] },
    { key: "lighter-necklace", label: t("Colar Isqueiro", "Lighter Necklace"), cols: ["Colar Isqueiro"] },
    { key: "table-lighter", label: t("Table Lighter", "Table Lighter"), cols: ["Table lighter"] },
  ],
  escrita: [
    { key: "initial", label: t("Initial", "Initial"), cols: ["Initial"] },
    { key: "line-d-eternity", label: t("Line D Eternity", "Line D Eternity"), cols: ["Line D Eternity"] },
    { key: "classique", label: t("Classique", "Classique"), cols: ["Classique"] },
    { key: "liberte", label: t("Liberté", "Liberté"), cols: ["Liberté"] },
    { key: "defi-millennium", label: t("Défi Millennium", "Défi Millennium"), cols: ["Défi Millennium"] },
    { key: "marker-necklace", label: t("Colar Marker", "Marker Necklace"), cols: ["Marker Necklace", "Colar Marker"] },
  ],
  pele: [
    { key: "apex", label: t("Apex", "Apex"), cols: ["Apex"] },
    { key: "x-bag", label: t("X-bag", "X-bag"), cols: ["X-bag"] },
    { key: "riviera", label: t("Riviera", "Riviera"), cols: ["Riviera"] },
    { key: "victoria", label: t("Victoria", "Victoria"), cols: ["Victoria"] },
    { key: "atelier", label: t("Atelier", "Atelier"), cols: ["Atelier"] },
    { key: "firehead", label: t("Firehead", "Firehead"), cols: ["Firehead"] },
    { key: "neo-capsule", label: t("Neo Capsule", "Neo Capsule"), cols: ["Neo Capsule"] },
    { key: "defi-explorer", label: t("Défi Explorer", "Défi Explorer"), cols: ["Défi Explorer"] },
    { key: "classic", label: t("Classic", "Classic"), cols: ["Classic"] },
  ],
  acessorios: [
    { key: "cufflinks", label: t("Botões de Punho", "Cufflinks"), cols: [], themeHref: "/t/cufflinks" },
    { key: "belts", label: t("Cintos", "Belts"), cols: [], themeHref: "/t/belts" },
    { key: "money-clips", label: t("Clips de Notas", "Money Clips"), cols: [], themeHref: "/t/money-clips" },
    { key: "key-holders", label: t("Porta-Chaves", "Key Holders"), cols: [], themeHref: "/t/key-holders" },
    { key: "tie-clips", label: t("Molas de Gravata", "Tie Clips"), cols: [], themeHref: "/t/tie-clips" },
    { key: "smoking", label: t("Acessórios para Fumadores", "Smoking Accessories"), cols: [], themeHref: "/t/smoking" },
    { key: "writing-accessories", label: t("Acessórios de Escrita", "Writing Accessories"), cols: [], themeHref: "/t/writing-accessories" },
    { key: "refill-stones", label: t("Recargas & Pedras", "Refills & Stones"), cols: [], themeHref: "/t/refill-stones" },
  ],
};
