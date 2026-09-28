import { NextResponse } from "next/server";

import { authorizeCajuiAction } from "@/features/integrations/server/authorization";
import { getCajuiSyncStatus } from "@/features/integrations/server/cajui";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ classId: string }> }) {
  const { classId } = await context.params;
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
