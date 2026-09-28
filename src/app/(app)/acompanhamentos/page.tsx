import type { Metadata } from "next";
import { RecordForm } from "@/features/records/components/record-form";
import { IntegrationNotice } from "@/components/ui/integration-notice";

export const metadata: Metadata = { title: "Acompanhamentos" };
export default async function RecordsPage({ searchParams }: { searchParams: Promise<{ studentId?: string }> }) {
  const { studentId } = await searchParams;
  const normalizedStudentId = studentId?.trim() || undefined;
  return <><div className="page-header"><div><h1>Novo acompanhamento</h1><p className="lede">Registre uma observação curta, contextualizada e útil para o acompanhamento pedagógico.</p></div></div><IntegrationNotice message="Registros pedagógicos complementam os dados acadêmicos: não geram rótulos ou decisões automáticas." /><section className="card section" style={{ marginTop: "1rem" }}><RecordForm studentId={normalizedStudentId} /></section></>;
}
