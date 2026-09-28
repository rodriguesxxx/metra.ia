"use client";

export default function GlobalError({ reset }: { reset: () => void }) { return <html lang="pt-BR"><body><main style={{ maxWidth: 650, paddingTop: "max(15vh, 3rem)" }}><section className="card section"><h1>Não foi possível concluir esta solicitação</h1><p className="lede">O problema pode ser temporário. Tente novamente.</p><div className="error-actions"><button className="button" onClick={reset}>Tentar novamente</button></div></section></main></body></html>; }
