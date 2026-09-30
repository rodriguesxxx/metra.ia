import "server-only";

import { apiFetch } from "@/services/server/api";
import { isMockDataEnabled } from "@/config/data-source";
import { syncCajuiClass } from "@/services/server/integrations/cajui";
import type { CajuiSyncResult } from "@/services/contracts/cajui";

/** Starts preparation explicitly; it never refreshes data while a council is being presented. */
export async function prepareClassCouncil(classId: string): Promise<CajuiSyncResult> {
  if (isMockDataEnabled()) return syncCajuiClass(classId);
  return await apiFetch<CajuiSyncResult>(`/class-councils/${encodeURIComponent(classId)}/prepare`, { method: "POST" });
}
