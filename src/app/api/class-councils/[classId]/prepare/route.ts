import { prepareCouncilResponse } from "@/services/server/council-prepare-response";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ classId: string }> }) {
  const { classId } = await context.params;
  return prepareCouncilResponse(classId);
}
