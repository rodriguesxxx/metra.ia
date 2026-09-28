import type { Metadata } from "next";
import { FileBarChart, ShieldAlert } from "lucide-react";
import { IntegrationNotice } from "@/components/ui/integration-notice";
import { CouncilWorkspace } from "@/features/reports/components/council-workspace";
import type { CouncilReportData } from "@/features/reports/council-data";
import { getClassCouncilReport, type ClassCouncilReport } from "@/features/reports/server/class-council-report";
import { getClassDetails, getClasses } from "@/features/classes/server/classes";
import { canStartCouncil } from "@/features/auth/server/authorization";
import { getSession } from "@/features/auth/server/session";
import { isMockDataEnabled } from "@/lib/data-source";
import { councilDemoClasses, mockCouncilReport } from "@/mocks/council";

export const metadata: Metadata = { title: "Conselho de classe" };

function CouncilSelection({ classes }: { classes: Array<{ id: string; name: string; courseName: string; termLabel: string }> }) {
  return <><div className="page-header"><div><h1>Conselho de Classe</h1><p className="lede">Prepare a reunião com dados acadêmicos recentes e o contexto necessário para uma análise compartilhada.</p></div></div><section className="card section"><div className="empty"><FileBarChart aria-hidden size={28} /><strong>Escolha uma turma para iniciar o Conselho</strong><p>Somente cursos elegíveis aparecem aqui. Antes da apresentação, o sistema pedirá uma atualização explícita dos dados acadêmicos.</p>{classes.length ? <form className="filters" action="/relatorios"><label className="field">Turma elegível<select name="classId" required defaultValue=""><option value="" disabled>Selecione a turma</option>{classes.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.courseName} · {item.termLabel}</option>)}</select></label><button className="button" type="submit">Preparar Conselho</button></form> : <p>Não há turmas elegíveis no seu escopo neste momento.</p>}</div></section></>;
}

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

  if (accessIssue === "denied") return <><div className="page-header"><div><h1>Conselho de Classe</h1><p className="lede">Acesso restrito ao escopo pedagógico da sua atuação.</p></div></div><section className="card section"><div className="empty"><ShieldAlert aria-hidden size={28} /><strong>Esta turma não está disponível para o seu perfil</strong><p>Conselhos podem ser preparados pelo Pedagógico ou pelo coordenador do curso correspondente.</p></div></section></>;
  if (accessIssue === "ineligible") return <><div className="page-header"><div><h1>Conselho de Classe</h1><p className="lede">A funcionalidade é exibida apenas para cursos elegíveis.</p></div></div><section className="card section"><div className="empty"><ShieldAlert aria-hidden size={28} /><strong>Curso fora do escopo de Conselho</strong><p>Esta turma não pertence às modalidades elegíveis informadas pela integração.</p></div></section></>;
  if (report) return <><div className="page-header"><div><h1>Conselho de Classe{report.className ? ` · ${report.className}` : ""}</h1><p className="lede">{report.termLabel ?? "Dados, contexto e navegação preparados para a reunião."}</p></div></div><CouncilWorkspace report={report} /></>;
  return <><div className="page-header"><div><h1>Conselho de Classe</h1><p className="lede">Uma síntese preparada para discussão, sem substituir a análise do Conselho.</p></div></div><IntegrationNotice message={error} /><section className="card section" style={{ marginTop: "1rem" }}><div className="empty"><FileBarChart aria-hidden size={28} /><strong>Relatório indisponível para esta turma</strong><p>Os dados já disponíveis não foram removidos. Tente novamente quando a integração estiver acessível.</p><a className="button" href={`/relatorios?classId=${encodeURIComponent(normalizedClassId)}`}>Tentar novamente</a></div></section></>;
}
