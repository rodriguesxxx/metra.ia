import Link from "next/link";

export default function NotFound() { return <main style={{ maxWidth: 650, paddingTop: "max(15vh, 3rem)" }}><section className="card section"><p className="context-label">Erro 404</p><h1>Esta página não foi encontrada</h1><p className="lede">Verifique o endereço ou retorne à visão geral para continuar a navegação.</p><div className="error-actions"><Link className="button" href="/dashboard">Ir para visão geral</Link></div></section></main>; }
