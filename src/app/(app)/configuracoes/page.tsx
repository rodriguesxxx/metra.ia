import type { Metadata } from "next";
import { DatabaseZap, ShieldCheck, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";
import { getSession } from "@/features/auth/server/session";
export const metadata: Metadata = { title: "Configurações" };
export default async function SettingsPage() {
  const user = await getSession();
  if (!user || user.role !== "administrator") notFound();
  return <><div className="page-header"><div><span className="context-label">Administração / informática</span><h1>Operação do sistema</h1><p className="lede">Usuários, perfis, integração e estado técnico — sem acesso pedagógico implícito.</p></div></div><section className="metrics" aria-label="Áreas administrativas"><article className="card metric"><UsersRound aria-hidden size={20} /><div className="metric-label">Usuários e perfis</div><div className="metric-value">Acessos</div><small>Vínculos de curso, turma e disciplina</small></article><article className="card metric"><DatabaseZap aria-hidden size={20} /><div className="metric-label">Integração acadêmica</div><div className="metric-value">Cajuí</div><small>Configuração e status de sincronização</small></article><article className="card metric"><ShieldCheck aria-hidden size={20} /><div className="metric-label">Proteção</div><div className="metric-value">Escopos</div><small>Permissões aplicadas no backend</small></article></section><section className="card section" style={{ marginTop: "1rem" }}><div className="empty"><ShieldCheck aria-hidden size={28} /><strong>O perfil administrativo não recebe dados pedagógicos por padrão</strong><p>A liberação excepcional exige a permissão explícita <code>pedagogical:read</code> emitida pelo backend.</p></div></section></>;
}
