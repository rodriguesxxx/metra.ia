import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/server/session";
import { canCreatePedagogicalRecord } from "@/features/auth/server/authorization";
import { pedagogicalRecordSchema, toPedagogicalRecordInput } from "@/features/records/record-schema";
import { getStudentAcademicScope } from "@/features/students/server/students";
import { isMockDataEnabled } from "@/lib/data-source";
import { createMockPedagogicalRecord } from "@/mocks/students";

export async function POST(request: Request) {
  let rawPayload: unknown;
  try { rawPayload = await request.json(); }
  catch { return NextResponse.json({ message: "Dados do acompanhamento inválidos." }, { status: 400 }); }
  const parsed = pedagogicalRecordSchema.safeParse(rawPayload);
  if (!parsed.success) return NextResponse.json({ message: "Dados do acompanhamento inválidos." }, { status: 400 });
  const payload = toPedagogicalRecordInput(parsed.data);

  const user = await getSession();
  if (!user) return NextResponse.json({ message: "Sessão necessária." }, { status: 401 });
  let scope: Awaited<ReturnType<typeof getStudentAcademicScope>>;
  try { scope = await getStudentAcademicScope(payload.studentId); }
  catch { return NextResponse.json({ message: "Estudante não encontrado." }, { status: 404 }); }
  if (!canCreatePedagogicalRecord(user, { ...scope, subjectId: payload.subjectId })) return NextResponse.json({ message: "Você não possui acesso a este estudante." }, { status: 403 });

  if (isMockDataEnabled()) return NextResponse.json({ ...createMockPedagogicalRecord(payload, { id: user.id, name: user.name }), transient: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  const baseUrl = process.env.METRA_API_URL;
  if (!baseUrl) return NextResponse.json({ message: "API não configurada" }, { status: 503 });
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/pedagogical-records`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", ...(request.headers.get("cookie") ? { Cookie: request.headers.get("cookie")! } : {}) }, body: JSON.stringify(payload), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ message: "Não foi possível salvar o acompanhamento." }, { status: response.status, headers: { "Cache-Control": "no-store" } });
  const result = await response.json().catch(() => ({})) as { id?: unknown };
  return NextResponse.json({ id: typeof result.id === "string" ? result.id : undefined }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
