import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { canCreatePedagogicalRecord } from "@/features/auth/server/authorization";
import { getSession } from "@/features/auth/server/session";
import { RecordForm } from "@/features/records/components/record-form";
import { getStudent, type StudentProfile } from "@/features/students/server/students";

export const metadata: Metadata = { title: "Acompanhamentos" };
export default async function RecordsPage({ searchParams }: { searchParams: Promise<{ studentId?: string }> }) {
  const { studentId } = await searchParams;
  const normalizedStudentId = studentId?.trim() || undefined;
  const user = await getSession();
  let student: StudentProfile | undefined;
  if (normalizedStudentId) {
    try { student = await getStudent(normalizedStudentId); } catch { notFound(); }
    if (!user || !canCreatePedagogicalRecord(user, { classId: student.classId, courseId: student.courseId })) notFound();
  } else if (user?.role !== "teacher" && user?.role !== "pedagogical") notFound();

  const items = [{ label: "Turmas", href: "/turmas" },
    ...(student?.classId ? [{ label: student.className, href: `/turmas/${encodeURIComponent(student.classId)}` }] : []),
    ...(student ? [{ label: student.name, href: `/estudantes/${encodeURIComponent(student.id)}` }] : []),
    { label: "Novo acompanhamento" }];
  return <><div className="page-header"><div><Breadcrumbs items={items} /><h1>Novo acompanhamento</h1></div></div><section className="card section"><RecordForm studentId={normalizedStudentId} /></section></>;
}
