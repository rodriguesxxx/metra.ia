import Link from "next/link";
import { ClipboardPenLine } from "lucide-react";
import { IntegrationNotice } from "@/components/ui/integration-notice";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { canCreatePedagogicalRecord, canManageStudentPhoto } from "@/features/auth/server/authorization";
import { getSession } from "@/features/auth/server/session";
import { PedagogicalTimeline } from "@/features/students/components/pedagogical-timeline";
import { StudentIdentity } from "@/features/students/components/student-identity";
import { getStudent, type StudentProfile } from "@/features/students/server/students";
import { formatGrade, formatPercent } from "@/lib/formatters";

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
      <StudentIdentity studentId={student.id} name={student.name} registration={student.registration} courseName={student.courseName} className={student.className} photoUrl={student.photoUrl} canManagePhoto={mayManagePhoto} />
      <section className="metrics" aria-label="Indicadores acadêmicos" style={{ marginTop: "1rem" }}>
        <article className="card metric"><div className="metric-label">Média global</div><div className="metric-value">{formatGrade(student.averageGrade)}</div></article>
        <article className="card metric"><div className="metric-label">Frequência</div><div className="metric-value">{formatPercent(student.attendanceRate)}</div></article>
        <article className="card metric"><div className="metric-label">Disciplinas</div><div className="metric-value">{student.subjects.length}</div></article>
        <article className="card metric"><div className="metric-label">Registros pedagógicos</div><div className="metric-value">{student.records?.length ?? 0}</div></article>
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
