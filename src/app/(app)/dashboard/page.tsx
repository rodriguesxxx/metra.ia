import { AlertTriangle, ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import { IntegrationNotice } from "@/components/ui/integration-notice";
import { AttentionBadge } from "@/components/ui/attention-badge";
import { getDashboardSummary } from "@/features/dashboard/server/dashboard";
import { getSession } from "@/features/auth/server/session";
import type { DashboardSummary } from "@/lib/contracts";
import { formatGrade, formatPercent } from "@/lib/formatters";

export default async function DashboardPage() {
  const user = await getSession();
  let summary: DashboardSummary | undefined;
  let error: string | undefined;
  const mayReadPedagogicalSummary = user?.role !== "administrator" || user.permissions.includes("pedagogical:read");
  if (mayReadPedagogicalSummary) {
    try { summary = await getDashboardSummary(); }
    catch (caught) { error = caught instanceof Error ? caught.message : undefined; }
  }

  const roleContent = user?.role === "teacher"
    ? { eyebrow: "Área do professor", title: "Métricas das minhas turmas", lede: "Desempenho, frequência e estudantes para acompanhar ao longo do semestre.", action: "/turmas", actionLabel: "Ver minhas turmas", section: "Estudantes para acompanhar" }
    : user?.role === "coordinator"
      ? { eyebrow: "Coordenação de curso", title: "Métricas do curso", lede: "Indicadores acadêmicos para acompanhar as turmas e preparar o Conselho de Classe.", action: "/turmas", actionLabel: "Ver turmas", section: "Estudantes para analisar" }
      : user?.role === "administrator"
        ? { eyebrow: "Administração técnica", title: "Visão técnica", lede: "Acompanhe a configuração da integração e os acessos ao sistema.", action: "/configuracoes", actionLabel: "Ver configurações", section: "Acesso aos dados" }
        : { eyebrow: "Equipe pedagógica", title: "Métricas educacionais", lede: "Uma leitura dos dados acadêmicos para o acompanhamento e o Conselho de Classe.", action: "/turmas", actionLabel: "Ver turmas", section: "Estudantes para analisar" };

  const metrics = summary ? [
    ["Estudantes em atenção", String(summary.attentionStudentCount), "Para análise pedagógica"],
    ["Frequência média", formatPercent(summary.attendanceRate), "Presença nas atividades"],
    ["Média geral", formatGrade(summary.averageGrade), "Desempenho consolidado"],
    ["Quedas recentes", String(summary.recentDeclineCount), "Variação no período"],
  ] : [];

  return <>
    <header className="dashboard-heading">
      <div>
        <span className="dashboard-overline">{roleContent.eyebrow}</span>
        <h1>{roleContent.title}</h1>
        <p className="lede">{roleContent.lede}</p>
      </div>
      <Link className="button secondary" href={roleContent.action}>{roleContent.actionLabel}<ArrowRight size={16} aria-hidden /></Link>
    </header>

    {error && <IntegrationNotice message={error} />}
    {summary && <section className="metrics dashboard-metrics" aria-label="Indicadores acadêmicos">{metrics.map(([label, value, description]) => <article className="card metric" key={label}><div className="metric-label">{label}</div><div className="metric-value">{value}</div><small>{description}</small></article>)}</section>}

    <section className="card section dashboard-analysis" aria-labelledby="dashboard-analysis-title">
      <div className="section-title"><div><span className="dashboard-overline">Leitura dos indicadores</span><h2 id="dashboard-analysis-title">{roleContent.section}</h2><p className="lede">{user?.role === "administrator" ? "Dados acadêmicos exigem autorização pedagógica específica." : "Abra o perfil para reunir notas, frequência, evolução e registros em uma mesma visão."}</p></div><BarChart3 aria-hidden color="var(--primary)" /></div>
      {summary ? (summary.priorityStudents.length ? <div className="table-wrap"><table><caption className="sr-only">Estudantes para análise</caption><thead><tr><th>Estudante</th><th>Situação</th><th>Média</th><th>Frequência</th></tr></thead><tbody>{summary.priorityStudents.map((student) => <tr key={student.id}><td><Link href={`/estudantes/${student.id}`}><strong>{student.name}</strong></Link></td><td><AttentionBadge level={student.attentionLevel} /></td><td>{formatGrade(student.averageGrade)}</td><td>{formatPercent(student.attendanceRate)}</td></tr>)}</tbody></table></div> : <div className="empty"><strong>Nenhum estudante nesta seleção</strong><p>Os indicadores atuais não retornaram estudantes para esta leitura.</p></div>) : <div className="empty"><AlertTriangle aria-hidden size={28} /><strong>{user?.role === "administrator" ? "Dados pedagógicos restritos" : "Aguardando indicadores acadêmicos"}</strong><p>{user?.role === "administrator" ? "Acesse as configurações técnicas para acompanhar a integração e os perfis." : "Os dados serão apresentados aqui quando a integração estiver disponível."}</p></div>}
    </section>
  </>;
}
