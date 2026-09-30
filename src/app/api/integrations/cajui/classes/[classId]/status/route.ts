import { getCajuiStatusResponse } from "@/services/server/integrations/status-response";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ classId: string }> }) {
  const { classId } = await context.params;
  return getCajuiStatusResponse(classId);
}
