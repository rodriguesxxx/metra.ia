import "server-only";

import { NextResponse } from "next/server";

import { prepareClassCouncil } from "@/services/server/prepare-council";
import { authorizeCajuiAction } from "@/services/server/integrations/authorization";
import { getCajuiSyncStatus, syncFailure } from "@/services/server/integrations/cajui";
import { ApiError } from "@/services/server/api";

export async function prepareCouncilResponse(classId: string) {
  if (!classId.trim()) return NextResponse.json({ message: "Turma inválida." }, { status: 400 });
  const authorization = await authorizeCajuiAction("prepare-council", classId);
  if (!authorization.ok) return NextResponse.json({ message: authorization.message }, { status: authorization.status });
  try {
    return NextResponse.json(await prepareClassCouncil(classId), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    const message = error instanceof Error ? error.message : "Não foi possível preparar o Conselho.";
    let previous;
    try { previous = await getCajuiSyncStatus(classId); } catch { /* Mantém a falha original sem expor detalhes. */ }
    return NextResponse.json({ ...syncFailure(previous, new Date().toISOString(), message), message }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
