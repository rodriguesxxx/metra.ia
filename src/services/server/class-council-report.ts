import "server-only";
import { apiFetch } from "@/services/server/api";
import type { CouncilReportData } from "@/domains/councils/contracts";
import { isMockDataEnabled } from "@/config/data-source";
import { mockClassCouncilReport } from "@/mocks/education";

export function getClassCouncilReport(classId: string) {
  if (isMockDataEnabled()) return Promise.resolve(mockClassCouncilReport(classId));
  return apiFetch<CouncilReportData>(`/class-councils/${encodeURIComponent(classId)}/report`);
}
