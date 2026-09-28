import { AlertTriangle, ArrowRight, BarChart3, Sparkles } from "lucide-react";
import Link from "next/link";
import { IntegrationNotice } from "@/components/ui/integration-notice";
import { AttentionBadge } from "@/components/ui/attention-badge";
import { getDashboardSummary } from "@/features/dashboard/server/dashboard";
import type { DashboardSummary } from "@/lib/contracts";
import { formatGrade, formatPercent } from "@/lib/formatters";

export default async function DashboardPage() {
  let summary: DashboardSummary | undefined; let error: string | undefined;
  try { summary = await getDashboardSummary(); } catch (caught) { error = caught instanceof Error ? caught.message : undefined; }
  const metrics = summary ? [
    ["Estudantes em atenção", String(summary.attentionStudentCount), "Priorização para acompanhamento"],
    ["Frequência média", formatPercent(summary.attendanceRate), "Sinal para retenção e busca ativa"],
    ["Média geral", formatGrade(summary.averageGrade), "Contexto de desempenho coletivo"],
    ["Quedas recentes", String(summary.recentDeclineCount), "Variação no período atual"],
  ] : [];
  return <>
    <section className="dashboard-hero">
      <div className="relative z-10"><div className="dashboard-eyebrow"><Sparkles aria-hidden size={15} /> Painel pedagógico</div><h1>Todo sinal pode virar um próximo passo.</h1><p className="lede">Veja onde a turma precisa de você primeiro — com contexto suficiente para agir, não apenas para observar.</p><Link className="button" href="/turmas">Explorar turmas <ArrowRight size={16} /></Link></div>
      <div className="relative z-10 mt-12 flex flex-wrap gap-2 text-xs font-bold text-violet-100"><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">Evidências, não achismos</span><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">Ação pedagógica</span></div>
    </section>
    {error && <IntegrationNotice message={error} />}
    {summary && <section className="metrics" aria-label="Indicadores do semestre" style={{ marginTop: "1rem" }}>{metrics.map(([label, value, description]) => <article className="card metric" key={label}><div className="metric-label">{label}</div><div className="metric-value">{value}</div><small>{description}</small></article>)}</section>}
    <section className="card section" style={{ marginTop: "1rem" }}><div className="section-title"><div><h2>Próximas decisões</h2><p className="lede">A visualização consolida apenas evidências que apoiam uma ação.</p></div><BarChart3 aria-hidden color="var(--primary)" /></div>{summary ? (summary.priorityStudents.length ? <div className="table-wrap"><table><caption className="sr-only">Estudantes que exigem análise</caption><thead><tr><th>Estudante</th><th>Situação</th><th>Média</th><th>Frequência</th></tr></thead><tbody>{summary.priorityStudents.map((student) => <tr key={student.id}><td><Link href={`/estudantes/${student.id}`}><strong>{student.name}</strong></Link></td><td><AttentionBadge level={student.attentionLevel} /></td><td>{formatGrade(student.averageGrade)}</td><td>{formatPercent(student.attendanceRate)}</td></tr>)}</tbody></table></div> : <div className="empty"><strong>Nenhum estudante prioritário identificado</strong><p>Não há situações de atenção retornadas para os filtros atuais.</p></div>) : <div className="empty"><AlertTriangle aria-hidden size={28} /><strong>Aguardando indicadores acadêmicos</strong><p>Quando os dados forem conectados, esta área priorizará estudantes em atenção, tendências de turma e disciplinas que exigem análise — sem transformar o dashboard em uma coleção de cards.</p></div>}</section>
  </>;
}
