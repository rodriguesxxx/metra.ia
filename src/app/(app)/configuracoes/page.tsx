import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { IntegrationNotice } from "@/components/ui/integration-notice";
export const metadata: Metadata = { title: "Configurações" };
export default function SettingsPage() { return <><div className="page-header"><div><h1>Configurações</h1><p className="lede">Integrações, conta e permissões administrativas.</p></div></div><IntegrationNotice /><section className="card section" style={{ marginTop: "1rem" }}><div className="empty"><ShieldCheck aria-hidden size={28} /><strong>Acesso administrativo dependerá das permissões da API</strong><p>O frontend aplicará permissões como orientação de interface; a autorização efetiva continua sendo responsabilidade do backend.</p></div></section></>; }
