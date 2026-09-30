import "server-only";

import { NextResponse } from "next/server";

import { authorizeCajuiAction } from "@/services/server/integrations/authorization";
import { getCajuiSyncStatus, syncCajuiClass, syncFailure } from "@/services/server/integrations/cajui";
import { ApiError } from "@/services/server/api";

export async function syncCajuiResponse(classId: string) {
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
