import "server-only";

import Link from "next/link";
import { ClipboardPenLine } from "lucide-react";
import { IntegrationNotice } from "@/components/shared/integration-notice";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { canCreatePedagogicalRecord, canManageStudentPhoto } from "@/domains/identity/authorization";
import { getSession } from "@/services/server/session";
import { PedagogicalTimeline } from "@/domains/pedagogy/components/pedagogical-timeline";
import { StudentIdentity } from "@/domains/students/components/student-identity";
import { EditableStudentAvatar } from "@/features/student-photo/components/editable-student-avatar";
import { getStudent } from "@/services/server/students";
import type { StudentProfile } from "@/domains/students/contracts";
import { formatGrade, formatPercent } from "@/lib/formatters";
import { MetricCard } from "@/components/shared/metric-card";

export async function StudentProfileScreen({ id }: { id: string }) {
  let student: StudentProfile | undefined;
  let error: string | undefined;
  try { student = await getStudent(id); }
  catch (caught) { error = caught instanceof Error ? caught.message : undefined; }

  const session = await getSession();
  const scope = { classId: student?.classId, courseId: student?.courseId };
  const mayManagePhoto = Boolean(student && session && canManageStudentPhoto(session, scope));
  const mayCreateRecord = Boolean(student && session && canCreatePedagogicalRecord(session, scope));

  return <>
    <div className="page-header">
      <div><Breadcrumbs items={[{ label: "Turmas", href: "/turmas" }, ...(student?.classId ? [{ label: student.className ?? "Turma", href: `/turmas/${encodeURIComponent(student.classId)}` }] : []), { label: student?.name ?? "Estudante" }]} />{!student && <h1>Estudante</h1>}</div>
      {mayCreateRecord && <Link className="button" href={`/acompanhamentos?studentId=${encodeURIComponent(id)}`}><ClipboardPenLine size={16} />Registrar acompanhamento</Link>}
    </div>
    {error && <IntegrationNotice message={error} />}
    {student && <>
      <StudentIdentity name={student.name} registration={student.registration} courseName={student.courseName} className={student.className} avatar={<EditableStudentAvatar studentId={student.id} name={student.name} photoUrl={student.photoUrl} canManagePhoto={mayManagePhoto} />} />
      <section className="metrics" aria-label="Indicadores acadêmicos" style={{ marginTop: "1rem" }}>
        <MetricCard label="Média global" value={formatGrade(student.averageGrade)} />
        <MetricCard label="Frequência" value={formatPercent(student.attendanceRate)} />
        <MetricCard label="Disciplinas" value={student.subjects.length} />
        <MetricCard label="Registros pedagógicos" value={student.records?.length ?? 0} />
      </section>
      <section className="card section" style={{ marginTop: "1rem" }}>
        <div className="section-title"><h2>Disciplinas</h2></div>
        <div className="table-wrap"><table><thead><tr><th>Disciplina</th><th>Média</th><th>Frequência</th><th>Recuperação</th></tr></thead><tbody>{student.subjects.map((subject) => <tr key={subject.id ?? subject.name}><td><strong>{subject.name}</strong></td><td>{formatGrade(subject.grade)}</td><td>{formatPercent(subject.attendanceRate)}</td><td>{subject.isInRecovery ? "Em recuperação" : "Não informado"}</td></tr>)}</tbody></table></div>
      </section>
      <section className="card section">
        <div className="section-title"><h2>Evolução acadêmica</h2></div>
        {student.gradeHistory?.length ? <div className="table-wrap"><table><thead><tr><th>Período</th><th>Média global</th></tr></thead><tbody>{student.gradeHistory.map((point) => <tr key={point.period}><td>{point.period}</td><td>{formatGrade(point.averageGrade)}</td></tr>)}</tbody></table></div> : <p className="lede">Ainda não há histórico de evolução disponível.</p>}
      </section>
      <section className="card section">
        <div className="section-title"><h2>Registros pedagógicos</h2></div>
        <PedagogicalTimeline records={student.records ?? []} />
      </section>
    </>}
  </>;
}
