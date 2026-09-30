import "server-only";

import { NextResponse } from "next/server";
import { canManageStudentPhoto, canReadPedagogicalData } from "@/domains/identity/authorization";
import { getSession } from "@/services/server/session";
import { getStudentAcademicScope } from "@/services/server/students";
import { hasExpectedImageSignature, validateStudentPhoto } from "@/domains/students/photo-validation";
import { isMockDataEnabled } from "@/config/data-source";
import { getMockStudentPhoto, setMockStudentPhoto } from "@/mocks/students";

async function authorizeStudentPhoto(studentId: string) {
  const user = await getSession();
  if (!user) return { error: NextResponse.json({ message: "Sessão necessária." }, { status: 401 }) };
  try {
    const scope = await getStudentAcademicScope(studentId);
    if (!canManageStudentPhoto(user, scope)) return { error: NextResponse.json({ message: "Você não possui permissão para alterar esta foto." }, { status: 403 }) };
  } catch {
    return { error: NextResponse.json({ message: "Estudante não encontrado." }, { status: 404 }) };
  }
  return {};
}

export async function getStudentPhoto(id: string) {
  if (!isMockDataEnabled()) return NextResponse.json({ message: "Imagem não disponível." }, { status: 404 });
  const user = await getSession();
  if (!user) return NextResponse.json({ message: "Sessão necessária." }, { status: 401 });
  try {
    const scope = await getStudentAcademicScope(id);
    if (!canReadPedagogicalData(user, scope)) return NextResponse.json({ message: "Você não possui acesso a esta foto." }, { status: 403 });
  } catch {
    return NextResponse.json({ message: "Estudante não encontrado." }, { status: 404 });
  }
  const photo = getMockStudentPhoto(id);
  if (!photo) return NextResponse.json({ message: "Imagem não cadastrada." }, { status: 404 });
  return new NextResponse(photo.data, { headers: { "Content-Type": photo.contentType, "Cache-Control": "no-store" } });
}

export async function updateStudentPhoto(request: Request, id: string) {
  const authorization = await authorizeStudentPhoto(id);
  if (authorization.error) return authorization.error;

  let form: FormData;
  try { form = await request.formData(); }
  catch { return NextResponse.json({ message: "Não foi possível processar a imagem." }, { status: 400 }); }
  const candidate = form.get("photo");
  if (!(candidate instanceof File)) return NextResponse.json({ message: "Selecione uma imagem para continuar." }, { status: 400 });
  const validationError = validateStudentPhoto(candidate);
  if (validationError) return NextResponse.json({ message: validationError }, { status: 400 });
  const bytes = new Uint8Array(await candidate.slice(0, 12).arrayBuffer());
  if (!hasExpectedImageSignature(candidate.type, bytes)) return NextResponse.json({ message: "O conteúdo da imagem não corresponde ao formato informado." }, { status: 400 });

  if (isMockDataEnabled()) {
    setMockStudentPhoto(id, candidate.type, new Uint8Array(await candidate.arrayBuffer()));
    return NextResponse.json({ photoUrl: `/api/students/${encodeURIComponent(id)}/photo`, transient: true }, { status: 201 });
  }

  const baseUrl = process.env.METRA_API_URL;
  if (!baseUrl) return NextResponse.json({ message: "API não configurada." }, { status: 503 });
  const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/students/${encodeURIComponent(id)}/photo`, {
    method: "POST",
    headers: { Accept: "application/json", ...(request.headers.get("cookie") ? { Cookie: request.headers.get("cookie")! } : {}) },
    body: form,
    cache: "no-store",
  });
  if (!upstream.ok) return NextResponse.json({ message: "Não foi possível atualizar a foto." }, { status: upstream.status, headers: { "Cache-Control": "no-store" } });
  const result = await upstream.json().catch(() => ({})) as { photoUrl?: unknown };
  return NextResponse.json({ photoUrl: typeof result.photoUrl === "string" ? result.photoUrl : `/api/students/${encodeURIComponent(id)}/photo` }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
