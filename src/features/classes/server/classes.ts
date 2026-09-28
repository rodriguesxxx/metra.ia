import "server-only";
import { apiFetch } from "@/lib/api";
import type { ClassDetails, ClassSummary, PageResult, StudentListItem } from "@/lib/contracts";
import { isMockDataEnabled } from "@/lib/data-source";
import { mockClassDetails, mockClasses, mockClassStudents } from "@/mocks/education";

export async function getClasses() {
  if (isMockDataEnabled()) return mockClasses();
  return apiFetch<PageResult<ClassSummary>>("/classes");
}

export async function getClassDetails(id: string) {
  if (isMockDataEnabled()) {
    const details = mockClassDetails(id);
    if (!details) throw new Error("Turma não encontrada.");
    return details;
  }
  return apiFetch<ClassDetails>(`/classes/${encodeURIComponent(id)}`);
}

export async function getClassStudents(id: string, query?: string) {
  if (isMockDataEnabled()) return mockClassStudents(id, query);
  const search = new URLSearchParams();
  if (query) search.set("q", query);
  return apiFetch<PageResult<StudentListItem>>(`/classes/${encodeURIComponent(id)}/students?${search}`);
}
