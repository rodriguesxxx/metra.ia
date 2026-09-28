import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from "lucide-react";
import { AttentionBadge } from "@/components/ui/attention-badge";
import type { ClassCouncilReport } from "@/features/reports/server/class-council-report";
import { formatGrade, formatPercent } from "@/lib/formatters";

function TrendDirection({ direction }: { direction?: ClassCouncilReport["trends"][number]["direction"] }) {
  if (direction === "improving") return <><ArrowUpRight aria-hidden size={16} /> Em melhora</>;
  if (direction === "worsening") return <><ArrowDownRight aria-hidden size={16} /> Em queda</>;
  return <><Minus aria-hidden size={16} /> Estável</>;
}

function trendTone(direction: ClassCouncilReport["trends"][number]["direction"]) {
  if (direction === "worsening") return "attention";
  return "normal";
}

function formatChange(change?: number) {
  if (change === undefined) return "Variação não informada";
  return `${change > 0 ? "+" : ""}${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(change)} p.p.`;
}

export function ClassCouncilReportView({ report }: { report: ClassCouncilReport }) {
  const { summary } = report;
  return <>
    <section className="metrics" aria-label="Resumo da turma">
      <article className="card metric"><div className="metric-label">Estudantes</div><div className="metric-value">{summary.studentCount ?? "Não informado"}</div></article>
      <article className="card metric"><div className="metric-label">Média geral</div><div className="metric-value">{formatGrade(summary.averageGrade)}</div></article>
      <article className="card metric"><div className="metric-label">Frequência</div><div className="metric-value">{formatPercent(summary.attendanceRate)}</div></article>
      <article className="card metric"><div className="metric-label">Em atenção</div><div className="metric-value">{summary.attentionStudentCount ?? "Não informado"}</div></article>
    </section>
    <section className="card section" style={{ marginTop: "1rem" }} aria-labelledby="prioridades-title">
      <div className="section-title"><div><h2 id="prioridades-title">Estudantes prioritários</h2><p className="lede">Pontos que merecem discussão e acompanhamento no conselho.</p></div></div>
      {report.priorities.length === 0 ? <p className="lede">Nenhum estudante prioritário foi indicado para esta turma.</p> : <div className="table-wrap"><table><caption className="sr-only">Estudantes prioritários para o conselho de classe</caption><thead><tr><th scope="col">Estudante</th><th scope="col">Situação</th><th scope="col">Evidência</th><th scope="col">Média</th><th scope="col">Frequência</th><th scope="col">Variação recente</th></tr></thead><tbody>{report.priorities.map((student) => <tr key={student.studentId}><td><Link href={`/estudantes/${encodeURIComponent(student.studentId)}`} className="context-label">{student.studentName} <ArrowRight aria-hidden size={14} /></Link></td><td><AttentionBadge level={student.attentionLevel} /></td><td>{student.reason ?? "Não informada"}</td><td>{formatGrade(student.averageGrade)}</td><td>{formatPercent(student.attendanceRate)}</td><td>{formatChange(student.recentChange)}</td></tr>)}</tbody></table></div>}
    </section>
    <section className="card section" style={{ marginTop: "1rem" }} aria-labelledby="tendencias-title">
      <div className="section-title"><div><h2 id="tendencias-title">Tendências e dificuldades recorrentes</h2><p className="lede">Leitura consolidada para orientar a discussão, sem substituir a análise pedagógica.</p></div></div>
      {report.trends.length === 0 ? <p className="lede">Não há tendências consolidadas para esta turma.</p> : <div className="table-wrap"><table><caption className="sr-only">Tendências da turma</caption><thead><tr><th scope="col">Indicador</th><th scope="col">Situação</th><th scope="col">Valor</th><th scope="col">Variação</th><th scope="col">Contexto</th></tr></thead><tbody>{report.trends.map((trend) => <tr key={trend.label}><td>{trend.label}</td><td><span className={`badge ${trendTone(trend.direction)}`}><TrendDirection direction={trend.direction} /></span></td><td>{trend.value === undefined ? "Não informado" : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(trend.value)}</td><td>{formatChange(trend.change)}</td><td>{trend.context ?? "Não informado"}</td></tr>)}</tbody></table></div>}
    </section>
    <section className="card section" style={{ marginTop: "1rem" }} aria-labelledby="encaminhamentos-title">
      <div className="section-title"><div><h2 id="encaminhamentos-title">Encaminhamentos</h2><p className="lede">Ações registradas para acompanhamento após o conselho.</p></div></div>
      {report.referrals.length === 0 ? <p className="lede">Nenhum encaminhamento foi registrado para esta turma.</p> : <ul style={{ display: "grid", gap: ".8rem", margin: 0, paddingLeft: "1.2rem" }}>{report.referrals.map((referral) => <li key={referral.id}><strong>{referral.title}</strong>{referral.description && <div className="lede">{referral.description}</div>}{referral.status && <div className="context-label">Status: {referral.status === "pending" ? "Pendente" : referral.status === "in_progress" ? "Em andamento" : "Concluído"}</div>}</li>)}</ul>}
    </section>
  </>;
}
