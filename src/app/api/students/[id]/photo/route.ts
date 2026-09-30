import { getStudentPhoto, updateStudentPhoto } from "@/services/server/student-photo";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext<"/api/students/[id]/photo">) {
  const { id } = await context.params;
  return getStudentPhoto(id);
}

export async function POST(request: Request, context: RouteContext<"/api/students/[id]/photo">) {
  const { id } = await context.params;
  return updateStudentPhoto(request, id);
}
