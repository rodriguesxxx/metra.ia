"use client";
export default function Error({ reset }: { reset: () => void }) { return <section className="card section"><h1>Não foi possível carregar a visão geral</h1><p className="lede">Tente novamente. Se o problema persistir, verifique a integração.</p><div className="error-actions"><button className="button" onClick={reset}>Tentar novamente</button></div></section>; }
