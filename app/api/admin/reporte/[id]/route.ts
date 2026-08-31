import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentStaff } from "@/lib/admin-auth";
import { assertSameOrigin, safeError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

// PATCH /api/admin/reporte/[id] — marca um reporte como resolvido.
//
// Além de limpar a lista, isto liberta a impressão digital: se o mesmo erro
// voltar depois de resolvido, cria um reporte NOVO em vez de somar ao antigo.
// É assim que se descobre que uma correcção não pegou — de outra forma o
// contador subia em silêncio e parecia o mesmo problema de sempre.
export async function PATCH(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const csrf = assertSameOrigin(_req);
  if (csrf) return csrf;

  const staff = await currentStaff();
  if (staff?.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "sem permissão" }, { status: 403 });
  }

  try {
    const { id } = await ctx.params;
    await prisma.reporte.update({ where: { id }, data: { resolvido: true } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return safeError(e, "não foi possível marcar o reporte");
  }
}
