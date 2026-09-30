import { syncCajuiResponse } from "@/services/server/integrations/sync-response";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ classId: string }> }) {
  const { classId } = await context.params;
  return syncCajuiResponse(classId);
}
