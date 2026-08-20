import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { put } from "@vercel/blob";
import {
  assertRateLimit,
  assertSameOrigin,
  isValidImageUrl,
  safeError,
  validateImageUpload,
} from "@/lib/admin-api";
import { invalidarCatalogo } from "@/lib/catalog-cache";

export const dynamic = "force-dynamic";

// Fotografia de fundo da faixa "Em Destaque" da homepage.
//
// POST (?upload=1) — recebe o ficheiro arrastado (ou escolhido), põe-no no
//                    Vercel Blob e grava logo a definição.
// PUT             — grava um URL escrito à mão, ou apaga a definição para
//                    voltar à fotografia que vem com o código.
//
// SÓ ADMIN: é a primeira coisa que o público vê, não é decisão de balcão.

export const CHAVE = "home.featured.background";

async function gravar(valor: string | null, userId: string | null) {
  if (valor === null) {
    await prisma.siteSetting.deleteMany({ where: { key: CHAVE } });
  } else {
    await prisma.siteSetting.upsert({
      where: { key: CHAVE },
      create: { key: CHAVE, value: valor },
      update: { value: valor },
    });
  }
  await prisma.adminAction.create({
    data: {
      userId,
      entityType: "SITE_SETTING",
      action: "UPDATE",
      entityId: CHAVE,
      note: valor ? "Fundo do Em Destaque trocado" : "Fundo do Em Destaque reposto no original",
      after: { value: valor } as object,
    },
  });
  // A homepage lê a definição pela mesma cache do catálogo.
  invalidarCatalogo();
}

export async function PUT(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "home-background", 30, 60_000);
  if (rl) return rl;
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  let body: { url?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  // string vazia (ou null) = repor o original que vem com o código
  const bruto = typeof body.url === "string" ? body.url.trim() : "";
  if (!bruto) {
    try {
      await gravar(null, gate.userId);
      return NextResponse.json({ ok: true, url: null });
    } catch (e) {
      return safeError(e, "não consegui repor o fundo");
    }
  }

  // Um caminho começado por "/" é um ficheiro nosso em public/; qualquer
  // outra coisa tem de ser um URL de imagem que aceitemos.
  const aceite = bruto.startsWith("/") || isValidImageUrl(bruto);
  if (!aceite) {
    return NextResponse.json(
      { ok: false, error: "URL de imagem inválido" },
      { status: 400 },
    );
  }
  try {
    await gravar(bruto, gate.userId);
    return NextResponse.json({ ok: true, url: bruto });
  } catch (e) {
    return safeError(e, "não consegui gravar o fundo");
  }
}

export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  // Mais apertado que o PUT: cada envio escreve no Blob, e cinco cliques
  // seguidos não devem deixar cinco cópias lá dentro.
  const rl = await assertRateLimit(req, "home-background-upload", 12, 60_000);
  if (rl) return rl;
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "BLOB_READ_WRITE_TOKEN não está definido neste deploy" },
      { status: 501 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "nenhum ficheiro" }, { status: 400 });
  }
  // Recusa o que não é imagem e o que é grande de mais ANTES de o carregar
  // para memória e de o empurrar para o Blob.
  const v = validateImageUpload(file);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: v.status });

  const stamp = String(Date.now());
  const nome = (file.name || "fundo.jpg").replace(/[^a-zA-Z0-9._-]/g, "_");
  try {
    const blob = await put(`home/featured-bg/${stamp}-${nome}`, file, { access: "public" });
    await gravar(blob.url, gate.userId);
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e) {
    return safeError(e, "não consegui carregar a imagem");
  }
}
