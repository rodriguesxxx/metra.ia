import type { CSSProperties } from "react";
import type { ClassDetails } from "@/lib/contracts";
import { formatGrade, formatPercent } from "@/lib/formatters";
import { academicTone, attentionTone } from "../class-metric-tone";

function Metric({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  const style = tone ? { "--metric-accent": tone } as CSSProperties : undefined;
  return <article className="card metric class-metric" style={style}><div className="metric-label">{label}</div><div className="metric-value">{value}</div></article>;
}

export function ClassMetrics({ details }: { details: ClassDetails }) {
  return <section className="metrics" aria-label="Indicadores da turma" style={{ marginTop: "1rem" }}>
    <Metric label="Estudantes" value={details.studentCount} />
    <Metric label="Média geral" value={formatGrade(details.averageGrade)} tone={academicTone(details.averageGrade, 10)} />
    <Metric label="Frequência" value={formatPercent(details.attendanceRate)} tone={academicTone(details.attendanceRate)} />
    <Metric label="Em atenção" value={details.attentionStudentCount ?? "—"} tone={attentionTone(details.attentionStudentCount, details.studentCount)} />
  </section>;
}
