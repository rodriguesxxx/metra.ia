import "server-only";

import { apiFetch } from "@/lib/api";
import { isMockDataEnabled } from "@/lib/data-source";
import { syncCajuiClass, type CajuiSyncResult } from "@/features/integrations/server/cajui";

/** Starts preparation explicitly; it never refreshes data while a council is being presented. */
export async function prepareClassCouncil(classId: string): Promise<CajuiSyncResult> {
  if (isMockDataEnabled()) return syncCajuiClass(classId);
  return await apiFetch<CajuiSyncResult>(`/class-councils/${encodeURIComponent(classId)}/prepare`, { method: "POST" });
}
