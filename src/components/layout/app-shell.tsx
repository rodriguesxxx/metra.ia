"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, BookOpenCheck, ClipboardPenLine, GraduationCap, Menu, Moon, Settings, Sun, UserRound, UsersRound, X } from "lucide-react";
import type { UserRole } from "@/lib/contracts";

const navigation: Array<{ href: string; label: string; icon: typeof BarChart3; roles?: UserRole[] }> = [
  { href: "/dashboard", label: "Visão geral", icon: BarChart3 },
  { href: "/turmas", label: "Turmas", icon: UsersRound, roles: ["pedagogical", "coordinator", "teacher"] },
  { href: "/relatorios", label: "Conselho de classe", icon: BookOpenCheck, roles: ["pedagogical", "coordinator", "teacher"] },
  { href: "/configuracoes", label: "Administração", icon: Settings, roles: ["administrator"] },
];

const roleLabels: Record<UserRole, string> = {
  pedagogical: "Equipe pedagógica",
  coordinator: "Coordenação de curso",
  teacher: "Professor(a)",
  administrator: "Administração / informática",
};

export function AppShell({ children, user }: { children: React.ReactNode; user?: { name: string; role: UserRole } }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);
  const closeAccount = () => setAccountOpen(false);
  const toggleTheme = () => { const nextTheme = !darkTheme; setDarkTheme(nextTheme); document.documentElement.dataset.theme = nextTheme ? "dark" : "light"; window.localStorage.setItem("metra-theme", nextTheme ? "dark" : "light"); };
  const visibleNavigation = navigation.filter((item) => !item.roles || (user && item.roles.includes(user.role)));
  const canCreateRecord = user?.role === "teacher" || user?.role === "pedagogical";
  return <div className="shell selection:bg-emerald-200/60">
    <header className="topbar">
      <Link href="/dashboard" className="brand"><span className="brand-mark"><GraduationCap size={20} /></span><span>Métrica</span></Link>
      <button className="icon-button" type="button" onClick={() => setMobileNavOpen((open) => !open)} aria-expanded={mobileNavOpen} aria-controls="main-navigation" aria-label={mobileNavOpen ? "Fechar navegação" : "Abrir navegação"}><Menu size={20} /></button>
      <nav className={`site-nav ${mobileNavOpen ? "mobile-open" : ""}`} id="main-navigation" aria-label="Navegação principal">{visibleNavigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={closeMobileNav} data-active={pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`))}><Icon aria-hidden size={16} />{label}</Link>)}</nav>
      <div className="topbar-actions">{canCreateRecord && <Link className="quick-action" href="/acompanhamentos"><ClipboardPenLine aria-hidden size={16} /><span>Novo registro</span></Link>}<button className="profile-trigger" type="button" onClick={() => setAccountOpen(true)} aria-haspopup="dialog" aria-expanded={accountOpen} aria-label="Abrir menu da conta"><div className="hidden text-right sm:block"><strong>{user ? user.name : "Sessão indisponível"}</strong><div className="context-label">{user ? roleLabels[user.role] : "Acesso restrito"}</div></div><span className="avatar transition-transform duration-300 hover:rotate-6" aria-hidden>{user ? user.name.slice(0, 1).toUpperCase() : "?"}</span></button></div>
    </header>
    <main id="main-content">{children}</main>
    {accountOpen && <div className="account-layer" role="presentation"><button className="account-backdrop" type="button" aria-label="Fechar menu da conta" onClick={closeAccount} /><aside className="account-panel" role="dialog" aria-modal="true" aria-label="Menu da conta"><div className="account-panel-header"><div><span className="context-label">Sua conta</span><h2>{user ? user.name : "Sessão indisponível"}</h2></div><button className="account-close" type="button" onClick={closeAccount} aria-label="Fechar menu"><X size={18} /></button></div><div className="account-person"><span className="account-avatar" aria-hidden>{user ? user.name.slice(0, 1).toUpperCase() : "?"}</span><div><strong>{user ? roleLabels[user.role] : "Acesso restrito"}</strong><p>{user ? "Sua sessão está ativa" : "Conecte a API para acessar sua conta"}</p></div></div><nav className="account-links" aria-label="Opções da conta">{canCreateRecord && <Link href="/acompanhamentos" onClick={closeAccount}><ClipboardPenLine aria-hidden size={17} />Acompanhamentos</Link>}{user?.role === "administrator" && <Link href="/configuracoes" onClick={closeAccount}><Settings aria-hidden size={17} />Configurações</Link>}<Link href="/perfil" onClick={closeAccount}><UserRound aria-hidden size={17} />Perfil</Link></nav><div className="theme-toggle"><div><strong>Tema da interface</strong><p>{darkTheme ? "Escuro" : "Claro"}</p></div><button type="button" onClick={toggleTheme} aria-pressed={darkTheme} className="theme-button">{darkTheme ? <Moon aria-hidden size={17} /> : <Sun aria-hidden size={17} />}<span>{darkTheme ? "Escuro" : "Claro"}</span></button></div></aside></div>}
  </div>;
}
