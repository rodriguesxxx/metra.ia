import { AlertTriangle, ArrowRight, BarChart3, Sparkles } from "lucide-react";
import Link from "next/link";
import { IntegrationNotice } from "@/components/ui/integration-notice";
import { AttentionBadge } from "@/components/ui/attention-badge";
import { getDashboardSummary } from "@/features/dashboard/server/dashboard";
import { getSession } from "@/features/auth/server/session";
import type { DashboardSummary } from "@/lib/contracts";
import { formatGrade, formatPercent } from "@/lib/formatters";

export default async function DashboardPage() {
  const user = await getSession();
  let summary: DashboardSummary | undefined; let error: string | undefined;
  const mayReadPedagogicalSummary = user?.role !== "administrator" || user.permissions.includes("pedagogical:read");
  if (mayReadPedagogicalSummary) try { summary = await getDashboardSummary(); } catch (caught) { error = caught instanceof Error ? caught.message : undefined; }
  const roleContent = user?.role === "teacher" ? { eyebrow: "Área do professor", title: "Suas turmas, com contexto para acompanhar.", lede: "Consulte as turmas em que leciona e registre acompanhamentos pontuais sem burocracia.", action: "/turmas", actionLabel: "Ver minhas turmas", section: "Acompanhamentos recentes" }
    : user?.role === "coordinator" ? { eyebrow: "Coordenação de curso", title: "Seu curso, pronto para acompanhar e reunir.", lede: "Priorize turmas, estudantes e a preparação do Conselho dentro do seu curso.", action: "/turmas", actionLabel: "Acompanhar turmas", section: "Situações para acompanhar" }
      : user?.role === "administrator" ? { eyebrow: "Administração técnica", title: "Integrações e acesso, sob controle.", lede: "Gerencie usuários, perfis e a disponibilidade técnica sem receber automaticamente dados pedagógicos.", action: "/configuracoes", actionLabel: "Abrir configurações", section: "Status técnico" }
        : { eyebrow: "Painel pedagógico", title: "Todo sinal pode virar um próximo passo.", lede: "Veja onde a turma precisa de você primeiro — com contexto suficiente para agir, não apenas para observar.", action: "/turmas", actionLabel: "Explorar turmas", section: "Próximas decisões" };
  const metrics = summary ? [
    ["Estudantes em atenção", String(summary.attentionStudentCount), "Priorização para acompanhamento"],
    ["Frequência média", formatPercent(summary.attendanceRate), "Sinal para retenção e busca ativa"],
    ["Média geral", formatGrade(summary.averageGrade), "Contexto de desempenho coletivo"],
    ["Quedas recentes", String(summary.recentDeclineCount), "Variação no período atual"],
  ] : [];
  return <>
    <section className="dashboard-hero">
      <div className="relative z-10"><div className="dashboard-eyebrow"><Sparkles aria-hidden size={15} /> {roleContent.eyebrow}</div><h1>{roleContent.title}</h1><p className="lede">{roleContent.lede}</p><Link className="button" href={roleContent.action}>{roleContent.actionLabel} <ArrowRight size={16} /></Link></div>
      <div className="relative z-10 mt-12 flex flex-wrap gap-2 text-xs font-bold text-violet-100"><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">Evidências, não achismos</span><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">Ação pedagógica</span></div>
    </section>
    {error && <IntegrationNotice message={error} />}
    {summary && <section className="metrics" aria-label="Indicadores do semestre" style={{ marginTop: "1rem" }}>{metrics.map(([label, value, description]) => <article className="card metric" key={label}><div className="metric-label">{label}</div><div className="metric-value">{value}</div><small>{description}</small></article>)}</section>}
    <section className="card section" style={{ marginTop: "1rem" }}><div className="section-title"><div><h2>{roleContent.section}</h2><p className="lede">{user?.role === "administrator" ? "A configuração técnica não concede leitura pedagógica por padrão." : "A visualização consolida apenas evidências que apoiam uma ação."}</p></div><BarChart3 aria-hidden color="var(--primary)" /></div>{summary ? (summary.priorityStudents.length ? <div className="table-wrap"><table><caption className="sr-only">Estudantes que exigem análise</caption><thead><tr><th>Estudante</th><th>Situação</th><th>Média</th><th>Frequência</th></tr></thead><tbody>{summary.priorityStudents.map((student) => <tr key={student.id}><td><Link href={`/estudantes/${student.id}`}><strong>{student.name}</strong></Link></td><td><AttentionBadge level={student.attentionLevel} /></td><td>{formatGrade(student.averageGrade)}</td><td>{formatPercent(student.attendanceRate)}</td></tr>)}</tbody></table></div> : <div className="empty"><strong>Nenhuma situação para acompanhar</strong><p>Não há situações retornadas para os filtros atuais.</p></div>) : <div className="empty"><AlertTriangle aria-hidden size={28} /><strong>{user?.role === "administrator" ? "Dados pedagógicos restritos" : "Aguardando indicadores acadêmicos"}</strong><p>{user?.role === "administrator" ? "Use Configurações para acompanhar a integração e os perfis de acesso." : "Quando os dados forem conectados, esta área priorizará estudantes em atenção, tendências de turma e disciplinas que exigem análise — sem transformar o dashboard em uma coleção de cards."}</p></div>}</section>
  </>;
}
