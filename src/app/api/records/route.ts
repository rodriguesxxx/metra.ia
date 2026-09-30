import { createPedagogicalRecordResponse } from "@/services/server/records";

export async function POST(request: Request) {
  return createPedagogicalRecordResponse(request);
}
