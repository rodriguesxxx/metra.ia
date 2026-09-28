import "server-only";
import { apiFetch, ApiError, isApiConfigured } from "@/lib/api";
import { isMockDataEnabled } from "@/lib/data-source";
import type { UserRole } from "@/lib/contracts";

export interface SessionUser {
  id: string;
  name: string;
  role: UserRole;
  permissions: string[];
  courseIds: string[];
  classIds: string[];
  subjectIds: string[];
}

function getMockSession(): SessionUser {
  const requestedRole = process.env.METRA_MOCK_ROLE;
  const role: UserRole = requestedRole === "teacher" || requestedRole === "pedagogical" || requestedRole === "administrator"
    ? requestedRole
    : "coordinator";
  const names: Record<UserRole, string> = {
    pedagogical: "Helena Martins",
    coordinator: "Marina Duarte",
    teacher: "Rafael Nunes",
    administrator: "Camila Torres",
  };
  return {
    id: `demo-${role}`,
    name: names[role],
    role,
    permissions: [],
    courseIds: role === "coordinator" ? ["course-tech-info"] : [],
    classIds: role === "teacher" ? ["info-2a-2026"] : [],
    subjectIds: role === "teacher" ? ["subject-math"] : [],
  };
}

/** Endpoint esperado: GET /auth/me. Sem API ou mock, falha fechado. */
export async function getSession(): Promise<SessionUser | null | undefined> {
  if (isMockDataEnabled()) return getMockSession();
  if (!isApiConfigured()) return null;
  try { return await apiFetch<SessionUser>("/auth/me"); }
  catch (error) { if (error instanceof ApiError && error.status === 401) return null; throw error; }
}
