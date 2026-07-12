// Twitter card mirrors the OG card 1:1 — same generator, same PNG.
// Config fields must be declared locally (not re-exported): Next 16
// requires static analysis of the segment's runtime/size/contentType.
import Opengraph from "./opengraph-image";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "S.T. Dupont — Maison de luxe française";

export default Opengraph;
