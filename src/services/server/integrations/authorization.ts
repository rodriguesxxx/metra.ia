import "server-only";

import { canReadPedagogicalData, canStartCouncil } from "@/domains/identity/authorization";
import { getClassDetails } from "@/services/server/classes";
import { getSession } from "@/services/server/session";

export type CajuiAction = "read-status" | "sync" | "prepare-council";

/**
 * UI visibility is never relied upon. The upstream API must additionally
 * enforce class/course scope for the current session before it syncs Cajuí.
 */
export async function authorizeCajuiAction(action: CajuiAction, classId: string) {
  const session = await getSession();
  if (session === null) return { ok: false as const, status: 401, message: "Sessão inválida ou expirada." };
  if (session === undefined) return { ok: false as const, status: 503, message: "Autenticação indisponível." };

  try {
    const classDetails = await getClassDetails(classId);
    if (classDetails.id !== classId) return { ok: false as const, status: 404, message: "Turma não encontrada." };
    const scope = { classId, courseId: classDetails.courseId };
    const allowed = action === "read-status" ? canReadPedagogicalData(session, scope) : canStartCouncil(session, scope);
    if (!allowed) return { ok: false as const, status: 403, message: "Você não possui permissão para esta operação." };
  } catch {
    // Do not reveal integration state or allow an action when its scope cannot be verified.
    return { ok: false as const, status: 404, message: "Turma não encontrada." };
  }
  return { ok: true as const, session };
}
