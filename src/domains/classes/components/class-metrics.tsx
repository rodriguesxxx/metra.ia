import type { CSSProperties } from "react";
import type { ClassDetails } from "@/domains/classes/contracts";
import { MetricCard } from "@/components/shared/metric-card";
import { formatGrade, formatPercent } from "@/lib/formatters";
import { academicTone, attentionTone } from "@/domains/classes/metric-tone";

export function ClassMetrics({ details }: { details: ClassDetails }) {
  return <section className="metrics" aria-label="Indicadores da turma" style={{ marginTop: "1rem" }}>
    <MetricCard className="class-metric" label="Estudantes" value={details.studentCount} />
    <MetricCard className="class-metric" label="Média geral" value={formatGrade(details.averageGrade)} style={{ "--metric-accent": academicTone(details.averageGrade, 10) } as CSSProperties} />
    <MetricCard className="class-metric" label="Frequência" value={formatPercent(details.attendanceRate)} style={{ "--metric-accent": academicTone(details.attendanceRate) } as CSSProperties} />
    <MetricCard className="class-metric" label="Em atenção" value={details.attentionStudentCount ?? "—"} style={{ "--metric-accent": attentionTone(details.attentionStudentCount, details.studentCount) } as CSSProperties} />
  </section>;
}
