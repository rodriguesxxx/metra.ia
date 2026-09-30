import "server-only";

import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { canCreatePedagogicalRecord } from "@/domains/identity/authorization";
import { getSession } from "@/services/server/session";
import { RecordForm } from "@/features/records/components/record-form";
import { getStudent } from "@/services/server/students";
import type { StudentProfile } from "@/domains/students/contracts";

export async function RecordScreen({ studentId }: { studentId?: string }) {
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
