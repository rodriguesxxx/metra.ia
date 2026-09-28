import { NextResponse } from "next/server";

import { authorizeCajuiAction } from "@/features/integrations/server/authorization";
import { getCajuiSyncStatus, syncCajuiClass, syncFailure } from "@/features/integrations/server/cajui";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ classId: string }> }) {
  const { classId } = await context.params;
  if (!classId.trim()) return NextResponse.json({ message: "Turma inválida." }, { status: 400 });
  const authorization = await authorizeCajuiAction("sync", classId);
  if (!authorization.ok) return NextResponse.json({ message: authorization.message }, { status: authorization.status });
  try {
    return NextResponse.json(await syncCajuiClass(classId), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    const message = error instanceof Error ? error.message : "Não foi possível sincronizar com o Cajuí.";
    let previous;
    try { previous = await getCajuiSyncStatus(classId); } catch { /* Mantém a falha original sem expor detalhes. */ }
    return NextResponse.json({ ...syncFailure(previous, new Date().toISOString(), message), message }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
