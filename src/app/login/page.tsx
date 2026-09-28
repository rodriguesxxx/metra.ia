import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Entrar" };
export default function LoginPage() { return <main style={{ maxWidth: 440, paddingTop: "max(10vh, 3rem)" }}><div className="brand" style={{ color: "var(--primary)", padding: 0, marginBottom: "2rem" }}><span className="brand-mark"><GraduationCap size={20} /></span>Métrica</div><section className="card section"><h1>Boas-vindas</h1><p className="lede">Acesse os indicadores para o Conselho de Classe.</p><div style={{ marginTop: "1.5rem" }}><LoginForm /></div></section></main>; }
