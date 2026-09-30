import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { IntegrationNotice } from "@/components/ui/integration-notice";
import { AttentionBadge } from "@/components/ui/attention-badge";
import { canReadPedagogicalData, canStartCouncil } from "@/features/auth/server/authorization";
import { getClasses } from "@/features/classes/server/classes";
import { summarizeClasses } from "@/features/dashboard/class-metrics";
import { PerformanceCharts } from "@/features/dashboard/components/performance-charts";
import { TemperatureMeter } from "@/features/dashboard/components/temperature-meter";
import { getDashboardSummary } from "@/features/dashboard/server/dashboard";
import { getClassCouncilReport } from "@/features/reports/server/class-council-report";
import { getSession } from "@/features/auth/server/session";
import { isMockDataEnabled } from "@/lib/data-source";
import { mockCouncilReport } from "@/mocks/council";
import type { ClassSummary, DashboardSummary } from "@/lib/contracts";
import { formatGrade, formatPercent } from "@/lib/formatters";

export default async function DashboardPage() {
  const user = await getSession();
  let summary: DashboardSummary | undefined;
  let classes: ClassSummary[] = [];
  let subjectGrades: Array<{ name: string; averageGrade?: number; attendanceRate?: number }> = [];
  let averageChange: number | undefined;
  let error: string | undefined;
  const mayReadPedagogicalData = Boolean(user && (user.role !== "administrator" || user.permissions.includes("pedagogical:read")));
  if (mayReadPedagogicalData) {
    try {
      const result = await getClasses();
      classes = user ? result.items.filter((item) => canReadPedagogicalData(user, { classId: item.id, courseId: item.courseId })) : [];
      if (user?.role === "pedagogical") summary = await getDashboardSummary();
      if (classes.length === 1 && user && classes[0].councilEligible && canStartCouncil(user, { classId: classes[0].id, courseId: classes[0].courseId })) {
        try {
          const report = isMockDataEnabled() ? mockCouncilReport(classes[0].id) : await getClassCouncilReport(classes[0].id);
          subjectGrades = report.subjects ?? [];
          averageChange = report.trends?.find((trend) => /média/i.test(trend.label))?.change;
        } catch { /* The aggregate cards remain available if subject detail is absent. */ }
      }
    }
    catch (caught) { error = caught instanceof Error ? caught.message : undefined; }
  }
  const analysis = summarizeClasses(classes);

  const roleContent = user?.role === "teacher"
    ? { title: "Minhas turmas", action: "/turmas", actionLabel: "Ver turmas" }
    : user?.role === "coordinator"
      ? { title: "Métricas do curso", action: "/turmas", actionLabel: "Ver turmas" }
      : user?.role === "administrator"
        ? { title: "Operação do sistema", action: "/configuracoes", actionLabel: "Ver configurações" }
        : { title: "Métricas educacionais", action: "/turmas", actionLabel: "Ver turmas" };

  const metrics = classes.length ? [
    ["Estudantes", String(analysis.studentCount)],
    ["Média geral", formatGrade(analysis.averageGrade)],
    ["Frequência média", formatPercent(analysis.attendanceRate)],
    ...(averageChange !== undefined ? [["Variação da média", `${averageChange > 0 ? "+" : ""}${formatGrade(averageChange)}`]] : summary ? [["Quedas recentes", String(summary.recentDeclineCount)]] : classes.length > 1 ? [["Turmas", String(analysis.classCount)]] : []),
  ] : [];

  return <>
    <header className="dashboard-heading">
      <h1>{roleContent.title}</h1>
      <Link className="button secondary" href={roleContent.action}>{roleContent.actionLabel}<ArrowRight size={16} aria-hidden /></Link>
    </header>

    {error && <IntegrationNotice message={error} />}
    {classes.length > 0 && <section className="metrics dashboard-metrics" aria-label="Indicadores das turmas visíveis">{metrics.map(([label, value]) => <article className="card metric" key={label}><div className="metric-label">{label}</div><div className="metric-value">{value}</div></article>)}</section>}

    {classes.length > 0 && <PerformanceCharts classes={classes} subjects={subjectGrades} />}

    {classes.length > 0 && <section className="card section dashboard-analysis" aria-label="Desempenho por turma">
      <div className="section-title"><h2>Desempenho por turma</h2><span className="context-label">{classes.length} {classes.length === 1 ? "turma" : "turmas"}</span></div>
      <div className="table-wrap"><table className="class-performance-table"><caption className="sr-only">Média e frequência por turma</caption><thead><tr><th>Turma</th><th>Estudantes</th><th>Média</th><th>Frequência</th><th><span className="sr-only">Ação</span></th></tr></thead><tbody>{classes.map((item) => { const href = `/turmas/${encodeURIComponent(item.id)}`; return <tr key={item.id}><td><Link className="class-cell-link" href={href}><strong>{item.name}</strong><br /><small>{item.courseName}</small></Link></td><td><Link className="class-cell-link" href={href} aria-label={`Abrir ${item.name}`}>{item.studentCount}</Link></td><td><Link className="class-cell-link" href={href} aria-label={`Abrir média de ${item.name}`}><TemperatureMeter value={item.averageGrade} max={10} label={`Média de ${item.name}`} /></Link></td><td><Link className="class-cell-link" href={href} aria-label={`Abrir frequência de ${item.name}`}><TemperatureMeter value={item.attendanceRate} max={100} label={`Frequência de ${item.name}`} /></Link></td><td><Link className="class-cell-link" href={href} aria-label={`Abrir ${item.name}`}><ArrowRight size={16} aria-hidden /></Link></td></tr>; })}</tbody></table></div>
    </section>}
    {summary?.priorityStudents.length ? <section className="card section dashboard-analysis" style={{ marginTop: "1rem" }} aria-label="Estudantes para acompanhamento"><div className="section-title"><h2>Acompanhamento</h2><span className="context-label">{summary.recentDeclineCount} quedas recentes</span></div><div className="table-wrap"><table><caption className="sr-only">Estudantes para acompanhamento</caption><thead><tr><th>Estudante</th><th>Situação</th><th>Média</th><th>Frequência</th></tr></thead><tbody>{summary.priorityStudents.map((student) => <tr key={student.id}><td><Link href={`/estudantes/${student.id}`}><strong>{student.name}</strong></Link></td><td><AttentionBadge level={student.attentionLevel} /></td><td>{formatGrade(student.averageGrade)}</td><td>{formatPercent(student.attendanceRate)}</td></tr>)}</tbody></table></div></section> : null}
    {!classes.length && <section className="card section dashboard-analysis"><div className="empty"><AlertTriangle aria-hidden size={28} /><strong>{user?.role === "administrator" ? "Dados pedagógicos restritos" : "Nenhuma turma disponível"}</strong></div></section>}
  </>;
}
