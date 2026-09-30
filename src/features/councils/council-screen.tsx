import "server-only";

import { FileBarChart, ShieldAlert } from "lucide-react";
import { IntegrationNotice } from "@/components/shared/integration-notice";
import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { CouncilWorkspace } from "@/features/councils/components/council-workspace";
import { CouncilSelection } from "@/features/councils/components/council-selection";
import type { CouncilReportData } from "@/domains/councils/contracts";
import { getCouncilSelectionClasses, getCouncilWorkspaceReport } from "@/services/server/council-workspace";
import { getClassDetails } from "@/services/server/classes";
import type { ClassSummary } from "@/domains/classes/contracts";
import { canStartCouncil } from "@/domains/identity/authorization";
import { getSession } from "@/services/server/session";


export async function CouncilScreen({ classId }: { classId?: string }) {
  const normalizedClassId = classId?.trim();
  const user = await getSession();

  if (!normalizedClassId) {
    let classes: ClassSummary[] = [];
    try { classes = await getCouncilSelectionClasses(); } catch { /* The selection below remains safely empty. */ }
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
      report = await getCouncilWorkspaceReport(normalizedClassId);
      report = { ...report, courseId: classDetails.courseId, courseName: report.courseName ?? classDetails.courseName, modality: classDetails.modality, councilEligible: classDetails.councilEligible };
    }
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Não foi possível carregar o relatório.";
  }

  if (accessIssue === "denied") return <><div className="page-header"><div><Breadcrumbs items={[{ label: "Conselho de Classe", href: "/relatorios" }, { label: "Turma indisponível" }]} /><h1>Conselho de Classe</h1><p className="lede">Acesso restrito ao escopo pedagógico da sua atuação.</p></div></div><section className="card section"><EmptyState icon={<ShieldAlert aria-hidden size={28} />} title="Esta turma não está disponível para o seu perfil"><p>Conselhos podem ser preparados pelo Pedagógico ou pelo coordenador do curso correspondente.</p></EmptyState></section></>;
  if (accessIssue === "ineligible") return <><div className="page-header"><div><Breadcrumbs items={[{ label: "Conselho de Classe", href: "/relatorios" }, { label: "Curso fora do escopo" }]} /><h1>Conselho de Classe</h1><p className="lede">A funcionalidade é exibida apenas para cursos elegíveis.</p></div></div><section className="card section"><EmptyState icon={<ShieldAlert aria-hidden size={28} />} title="Curso fora do escopo de Conselho"><p>Esta turma não pertence às modalidades elegíveis informadas pela integração.</p></EmptyState></section></>;
  if (report) return <><div className="page-header"><div><Breadcrumbs items={[{ label: "Conselho de Classe", href: "/relatorios" }, { label: report.className ?? "Turma selecionada" }]} /><h1 style={{ marginTop: ".5rem" }}>{report.className ?? "Turma selecionada"}</h1>{report.termLabel && <p className="lede">{report.termLabel}</p>}</div></div><CouncilWorkspace report={report} /></>;
  return <><div className="page-header"><div><Breadcrumbs items={[{ label: "Conselho de Classe", href: "/relatorios" }, { label: "Relatório indisponível" }]} /><h1>Conselho de Classe</h1><p className="lede">Uma síntese preparada para discussão, sem substituir a análise do Conselho.</p></div></div><IntegrationNotice message={error} /><section className="card section" style={{ marginTop: "1rem" }}><EmptyState icon={<FileBarChart aria-hidden size={28} />} title="Relatório indisponível para esta turma"><p>Os dados já disponíveis não foram removidos. Tente novamente quando a integração estiver acessível.</p><a className="button" href={`/relatorios?classId=${encodeURIComponent(normalizedClassId)}`}>Tentar novamente</a></EmptyState></section></>;
}
