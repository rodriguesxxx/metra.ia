import "server-only";
import { apiFetch, ApiError, isApiConfigured } from "@/lib/api";
import { isMockDataEnabled } from "@/lib/data-source";

export interface SessionUser {
  id: string;
  name: string;
  role: "teacher" | "coordinator" | "administrator";
  permissions: string[];
}

/** Endpoint esperado: GET /auth/me. Sem API configurada, mantém a casca acessível para desenvolvimento visual. */
export async function getSession(): Promise<SessionUser | null | undefined> {
  if (isMockDataEnabled()) return { id: "demo-coordination", name: "Marina Duarte", role: "coordinator", permissions: ["classes:read", "reports:read", "records:write"] };
  if (!isApiConfigured()) return undefined;
  try { return await apiFetch<SessionUser>("/auth/me"); }
  catch (error) { if (error instanceof ApiError && error.status === 401) return null; throw error; }
}
