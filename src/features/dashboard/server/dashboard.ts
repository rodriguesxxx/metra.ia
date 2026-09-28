import "server-only";
import { apiFetch } from "@/lib/api";
import type { DashboardSummary } from "@/lib/contracts";
import { isMockDataEnabled } from "@/lib/data-source";
import { mockDashboard } from "@/mocks/education";

/** Endpoint esperado: GET /dashboard. Alinhar este contrato ao OpenAPI quando disponível. */
export function getDashboardSummary() {
  if (isMockDataEnabled()) return Promise.resolve(mockDashboard);
  return apiFetch<DashboardSummary>("/dashboard");
}
