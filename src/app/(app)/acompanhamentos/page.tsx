import type { Metadata } from "next";
import { RecordForm } from "@/features/records/components/record-form";
import { IntegrationNotice } from "@/components/ui/integration-notice";

export const metadata: Metadata = { title: "Acompanhamentos" };
export default function RecordsPage() { return <><div className="page-header"><div><h1>Novo acompanhamento</h1><p className="lede">Registre uma observação curta, contextualizada e acionável.</p></div></div><IntegrationNotice message="O envio será conectado ao endpoint de registros pedagógicos assim que o contrato do backend estiver disponível." /><section className="card section" style={{ marginTop: "1rem" }}><RecordForm /></section></>; }
