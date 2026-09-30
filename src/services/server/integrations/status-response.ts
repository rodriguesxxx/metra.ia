import "server-only";

import { NextResponse } from "next/server";

import { authorizeCajuiAction } from "@/services/server/integrations/authorization";
import { getCajuiSyncStatus } from "@/services/server/integrations/cajui";
import { ApiError } from "@/services/server/api";

export async function getCajuiStatusResponse(classId: string) {
  if (!classId.trim()) return NextResponse.json({ message: "Turma inválida." }, { status: 400 });
  const authorization = await authorizeCajuiAction("read-status", classId);
  if (!authorization.ok) return NextResponse.json({ message: authorization.message }, { status: authorization.status });
  try {
    return NextResponse.json(await getCajuiSyncStatus(classId), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    return NextResponse.json({ message: error instanceof Error ? error.message : "Não foi possível consultar a sincronização." }, { status });
  }
}
