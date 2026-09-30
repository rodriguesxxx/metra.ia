import type { Metadata } from "next";
import { FileBarChart, ShieldAlert } from "lucide-react";
import { IntegrationNotice } from "@/components/ui/integration-notice";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CouncilWorkspace } from "@/features/reports/components/council-workspace";
import { CouncilSelection } from "@/features/reports/components/council-selection";
import type { CouncilReportData } from "@/features/reports/council-data";
import { getClassCouncilReport, type ClassCouncilReport } from "@/features/reports/server/class-council-report";
import { getClassDetails, getClasses } from "@/features/classes/server/classes";
import { canStartCouncil } from "@/features/auth/server/authorization";
import { getSession } from "@/features/auth/server/session";
import { isMockDataEnabled } from "@/lib/data-source";
import { councilDemoClasses, mockCouncilReport } from "@/mocks/council";

export const metadata: Metadata = { title: "Conselho de classe" };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ classId?: string }> }) {
  const { classId } = await searchParams;
  const normalizedClassId = classId?.trim();
  const user = await getSession();
  const isDemo = isMockDataEnabled();

  if (!normalizedClassId) {
    let classes = isDemo ? councilDemoClasses : [];
    if (!isDemo) {
      try { classes = (await getClasses()).items; } catch { /* The selection below remains safely empty. */ }
    }
    const eligible = classes.filter((item) => item.councilEligible && user && canStartCouncil(user, { classId: item.id, courseId: item.courseId }));
    return <CouncilSelection classes={eligible} />;
  }

  let report: CouncilReportData | undefined;
  let error: string | undefined;
  let accessIssue: "denied" | "ineligible" | undefined;
  try {
    const classDetails = await getClassDetails(normalizedClassId);
    if (!user || !canStartCouncil(user, { classId: classDetails.id, courseId: classDetails.courseId })) {
      accessIssue = "denied";
    } else if (!classDetails.councilEligible) {
      accessIssue = "ineligible";
    } else {
      report = isDemo ? mockCouncilReport(normalizedClassId) : await getClassCouncilReport(normalizedClassId) as ClassCouncilReport as CouncilReportData;
      report = { ...report, courseId: classDetails.courseId, courseName: report.courseName ?? classDetails.courseName, modality: classDetails.modality, councilEligible: classDetails.councilEligible };
    }
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Não foi possível carregar o relatório.";
  }

  if (accessIssue === "denied") return <><div className="page-header"><div><Breadcrumbs items={[{ label: "Conselho de Classe", href: "/relatorios" }, { label: "Turma indisponível" }]} /><h1>Conselho de Classe</h1><p className="lede">Acesso restrito ao escopo pedagógico da sua atuação.</p></div></div><section className="card section"><div className="empty"><ShieldAlert aria-hidden size={28} /><strong>Esta turma não está disponível para o seu perfil</strong><p>Conselhos podem ser preparados pelo Pedagógico ou pelo coordenador do curso correspondente.</p></div></section></>;
  if (accessIssue === "ineligible") return <><div className="page-header"><div><Breadcrumbs items={[{ label: "Conselho de Classe", href: "/relatorios" }, { label: "Curso fora do escopo" }]} /><h1>Conselho de Classe</h1><p className="lede">A funcionalidade é exibida apenas para cursos elegíveis.</p></div></div><section className="card section"><div className="empty"><ShieldAlert aria-hidden size={28} /><strong>Curso fora do escopo de Conselho</strong><p>Esta turma não pertence às modalidades elegíveis informadas pela integração.</p></div></section></>;
  if (report) return <><div className="page-header"><div><Breadcrumbs items={[{ label: "Conselho de Classe", href: "/relatorios" }, { label: report.className ?? "Turma selecionada" }]} /><h1 style={{ marginTop: ".5rem" }}>{report.className ?? "Turma selecionada"}</h1>{report.termLabel && <p className="lede">{report.termLabel}</p>}</div></div><CouncilWorkspace report={report} /></>;
  return <><div className="page-header"><div><Breadcrumbs items={[{ label: "Conselho de Classe", href: "/relatorios" }, { label: "Relatório indisponível" }]} /><h1>Conselho de Classe</h1><p className="lede">Uma síntese preparada para discussão, sem substituir a análise do Conselho.</p></div></div><IntegrationNotice message={error} /><section className="card section" style={{ marginTop: "1rem" }}><div className="empty"><FileBarChart aria-hidden size={28} /><strong>Relatório indisponível para esta turma</strong><p>Os dados já disponíveis não foram removidos. Tente novamente quando a integração estiver acessível.</p><a className="button" href={`/relatorios?classId=${encodeURIComponent(normalizedClassId)}`}>Tentar novamente</a></div></section></>;
}
