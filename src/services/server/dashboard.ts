import "server-only";
import { apiFetch } from "@/services/server/api";
import type { DashboardSummary } from "@/services/contracts/dashboard";
import { isMockDataEnabled } from "@/config/data-source";
import { mockDashboard } from "@/mocks/education";

/** Endpoint esperado: GET /dashboard. Alinhar este contrato ao OpenAPI quando disponível. */
export function getDashboardSummary() {
  if (isMockDataEnabled()) return Promise.resolve(mockDashboard);
  return apiFetch<DashboardSummary>("/dashboard");
}
