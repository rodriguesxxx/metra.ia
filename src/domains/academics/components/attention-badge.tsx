import { AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react";
import type { AttentionLevel } from "@/domains/academics/contracts";

const labels: Record<AttentionLevel, string> = { normal: "Regular", attention: "Atenção", critical: "Crítico" };
const icons = { normal: CheckCircle2, attention: CircleAlert, critical: AlertTriangle };

export function AttentionBadge({ level }: { level: AttentionLevel }) {
  const Icon = icons[level];
  return <span className={`badge ${level}`}><Icon aria-hidden size={14} />{labels[level]}</span>;
}
