import type { PedagogicalRecord } from "@/lib/contracts";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Data não informada" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function PedagogicalTimeline({ records }: { records: PedagogicalRecord[] }) {
  if (!records.length) return <div className="empty"><strong>Sem registros pedagógicos até o momento</strong><p>Quando houver observações, elas aparecerão aqui em ordem cronológica para contextualizar o acompanhamento.</p></div>;
  return <ol style={{ display: "grid", gap: ".8rem", margin: 0, padding: 0, listStyle: "none" }} aria-label="Linha do tempo pedagógica">
    {[...records].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).map((record) => <li key={record.id} style={{ borderLeft: "3px solid var(--primary)", paddingLeft: "1rem" }}><div className="context-label">{formatDate(record.createdAt)} · {record.teacherName}{record.subjectName ? ` · ${record.subjectName}` : ""}</div>{record.categoryLabel || record.category ? <span className="badge normal" style={{ marginTop: ".4rem" }}>{record.categoryLabel ?? record.category}</span> : null}<p style={{ margin: ".45rem 0 0" }}>{record.note}</p>{record.period ? <small className="context-label">{record.period}</small> : null}</li>)}
  </ol>;
}
