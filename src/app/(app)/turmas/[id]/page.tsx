import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { IntegrationNotice } from "@/components/ui/integration-notice";
import { StudentList } from "@/features/classes/components/student-list";
import { getClassDetails, getClassStudents } from "@/features/classes/server/classes";
import type { ClassDetails, StudentListItem } from "@/lib/contracts";
import { formatGrade, formatPercent } from "@/lib/formatters";

export default async function ClassDetailsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ q?: string }> }) {
  const [{ id }, { q }] = await Promise.all([params, searchParams]);
  let details: ClassDetails | undefined; let students: StudentListItem[] = []; let error: string | undefined;
  try { [details, { items: students }] = await Promise.all([getClassDetails(id), getClassStudents(id, q)]); } catch (caught) { error = caught instanceof Error ? caught.message : undefined; }
  const title = details?.name ?? "Detalhe da turma";
  return <><div className="page-header"><div><Link href="/turmas" className="context-label"><ArrowLeft size={14} aria-hidden /> Voltar para turmas</Link><h1 style={{ marginTop: ".5rem" }}>{title}</h1><p className="lede">{details ? `${details.courseName} · ${details.termLabel}` : "Indicadores, estudantes e acompanhamento pedagógico."}</p></div><Link className="button" href="/acompanhamentos">Registrar acompanhamento</Link></div>{error && <IntegrationNotice message={error} />}{details && <section className="metrics" aria-label="Indicadores da turma" style={{ marginTop: "1rem" }}><article className="card metric"><div className="metric-label">Estudantes</div><div className="metric-value">{details.studentCount}</div></article><article className="card metric"><div className="metric-label">Média geral</div><div className="metric-value">{formatGrade(details.averageGrade)}</div></article><article className="card metric"><div className="metric-label">Frequência</div><div className="metric-value">{formatPercent(details.attendanceRate)}</div></article><article className="card metric"><div className="metric-label">Em atenção</div><div className="metric-value">{details.attentionStudentCount ?? "—"}</div></article></section>}<section className="card section" style={{ marginTop: "1rem" }}><div className="section-title"><h2>Estudantes</h2></div><form className="filters"><label className="field">Buscar estudante<input name="q" defaultValue={q} placeholder="Nome ou matrícula" /></label><button className="button secondary" type="submit"><Search size={16} />Buscar</button></form><div style={{ marginTop: "1rem" }}><StudentList students={students} /></div></section></>;
}
