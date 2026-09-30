import type { Metadata } from "next";
import { DatabaseZap, ShieldCheck, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";
import { getSession } from "@/services/server/session";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
export const metadata: Metadata = { title: "Configurações" };
export default async function SettingsPage() {
  const user = await getSession();
  if (!user || user.role !== "administrator") notFound();
  return <><div className="page-header"><div><span className="context-label">Administração / informática</span><h1>Operação do sistema</h1><p className="lede">Usuários, perfis, integração e estado técnico — sem acesso pedagógico implícito.</p></div></div><section className="metrics" aria-label="Áreas administrativas"><MetricCard icon={<UsersRound aria-hidden size={20} />} label="Usuários e perfis" value="Acessos"><small>Vínculos de curso, turma e disciplina</small></MetricCard><MetricCard icon={<DatabaseZap aria-hidden size={20} />} label="Integração acadêmica" value="Cajuí"><small>Configuração e status de sincronização</small></MetricCard><MetricCard icon={<ShieldCheck aria-hidden size={20} />} label="Proteção" value="Escopos"><small>Permissões aplicadas no backend</small></MetricCard></section><section className="card section" style={{ marginTop: "1rem" }}><EmptyState icon={<ShieldCheck aria-hidden size={28} />} title="O perfil administrativo não recebe dados pedagógicos por padrão"><p>A liberação excepcional exige a permissão explícita <code>pedagogical:read</code> emitida pelo backend.</p></EmptyState></section></>;
}
