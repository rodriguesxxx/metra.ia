import Link from "next/link";
import { ArrowLeft, ClipboardPenLine } from "lucide-react";
import { AttentionBadge } from "@/components/ui/attention-badge";
import { IntegrationNotice } from "@/components/ui/integration-notice";
import { getStudent, type StudentProfile } from "@/features/students/server/students";
import { formatGrade, formatPercent } from "@/lib/formatters";

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; let student: StudentProfile | undefined; let error: string | undefined;
  try { student = await getStudent(id); } catch (caught) { error = caught instanceof Error ? caught.message : undefined; }
  return <><div className="page-header"><div><Link href="/turmas" className="context-label"><ArrowLeft size={14} aria-hidden /> Voltar para turmas</Link><h1 style={{ marginTop: ".5rem" }}>{student?.name ?? "Perfil do estudante"}</h1><p className="lede">{student ? `${student.className} · Matrícula ${student.registration}` : "Desempenho, frequência e histórico pedagógico."}</p></div><Link className="button" href={`/acompanhamentos?studentId=${encodeURIComponent(id)}`}><ClipboardPenLine size={16} />Registrar acompanhamento</Link></div>{error && <IntegrationNotice message={error} />}{student && <><section className="metrics" aria-label="Indicadores do estudante" style={{ marginTop: "1rem" }}><article className="card metric"><div className="metric-label">Situação</div><div style={{ marginTop: ".45rem" }}><AttentionBadge level={student.attentionLevel} /></div></article><article className="card metric"><div className="metric-label">Média</div><div className="metric-value">{formatGrade(student.averageGrade)}</div></article><article className="card metric"><div className="metric-label">Frequência</div><div className="metric-value">{formatPercent(student.attendanceRate)}</div></article></section><section className="card section" style={{ marginTop: "1rem" }}><div className="section-title"><h2>Disciplinas</h2></div><div className="table-wrap"><table><thead><tr><th>Disciplina</th><th>Média</th><th>Frequência</th></tr></thead><tbody>{student.subjects.map((subject) => <tr key={subject.name}><td><strong>{subject.name}</strong></td><td>{formatGrade(subject.grade)}</td><td>{formatPercent(subject.attendanceRate)}</td></tr>)}</tbody></table></div></section></>}</>;
}
