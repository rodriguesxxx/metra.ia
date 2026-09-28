import type { Metadata } from "next";
import { FileBarChart } from "lucide-react";
import { IntegrationNotice } from "@/components/ui/integration-notice";
import { ClassCouncilReportView } from "@/features/reports/components/class-council-report";
import { getClassCouncilReport, type ClassCouncilReport } from "@/features/reports/server/class-council-report";

export const metadata: Metadata = { title: "Conselho de classe" };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ classId?: string }> }) {
  const { classId } = await searchParams;
  const normalizedClassId = classId?.trim();
  if (!normalizedClassId) return <><div className="page-header"><div><h1>Conselho de Classe</h1><p className="lede">Uma síntese preparada para discussão: evidências, prioridades e encaminhamentos.</p></div></div><section className="card section"><div className="empty"><FileBarChart aria-hidden size={28} /><strong>Selecione uma turma para preparar o relatório</strong><p>Informe o identificador da turma para consultar a síntese consolidada do Conselho de Classe.</p><form className="filters" action="/relatorios"><label className="field">Identificador da turma<input name="classId" required placeholder="Ex.: 8A-2026" /></label><button className="button" type="submit">Preparar relatório</button></form></div></section></>;
  let report: ClassCouncilReport | undefined;
  let error: string | undefined;
  try { report = await getClassCouncilReport(normalizedClassId); } catch (caught) { error = caught instanceof Error ? caught.message : "Não foi possível carregar o relatório."; }
  if (report) return <><div className="page-header"><div><h1>Conselho de Classe{report.className ? ` · ${report.className}` : ""}</h1><p className="lede">{report.termLabel ?? "Uma síntese preparada para discussão: evidências, prioridades e encaminhamentos."}</p></div></div><form className="filters" action="/relatorios" style={{ marginBottom: "1rem" }}><label className="field">Identificador da turma<input name="classId" required defaultValue={normalizedClassId} /></label><button className="button secondary" type="submit">Consultar turma</button></form><ClassCouncilReportView report={report} /></>;
  return <><div className="page-header"><div><h1>Conselho de Classe</h1><p className="lede">Uma síntese preparada para discussão: evidências, prioridades e encaminhamentos.</p></div></div><IntegrationNotice message={error} /><section className="card section" style={{ marginTop: "1rem" }}><div className="empty"><FileBarChart aria-hidden size={28} /><strong>Relatório indisponível para esta turma</strong><p>Verifique o identificador informado ou tente novamente quando a integração estiver disponível.</p><form className="filters" action="/relatorios"><label className="field">Identificador da turma<input name="classId" required defaultValue={normalizedClassId} /></label><button className="button" type="submit">Tentar novamente</button></form></div></section></>;
}
