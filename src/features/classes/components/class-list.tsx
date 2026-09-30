import Link from "next/link";
import { ArrowRight, GraduationCap, MonitorPlay } from "lucide-react";
import type { ClassSummary } from "@/lib/contracts";
import { formatGrade, formatPercent } from "@/lib/formatters";

export function ClassList({ classes, showCouncilAction = false }: { classes: ClassSummary[]; showCouncilAction?: boolean }) {
  if (!classes.length) return <div className="empty"><GraduationCap aria-hidden size={28} /><strong>Nenhuma turma encontrada</strong></div>;
  return <div className="table-wrap"><table><caption className="sr-only">Turmas disponíveis</caption><thead><tr><th>Turma</th><th>Curso</th><th>Estudantes</th><th>Média</th><th>Frequência</th><th>Ação</th></tr></thead><tbody>{classes.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><br /><small>{item.termLabel}</small></td><td>{item.courseName}</td><td>{item.studentCount}</td><td>{formatGrade(item.averageGrade)}</td><td>{formatPercent(item.attendanceRate)}</td><td><div className="flex flex-wrap gap-2"><Link href={`/turmas/${item.id}`} className="button secondary">Abrir <ArrowRight size={15} /></Link>{showCouncilAction && item.councilEligible && <Link href={`/relatorios?classId=${encodeURIComponent(item.id)}`} className="button secondary"><MonitorPlay size={15} />Conselho</Link>}</div></td></tr>)}</tbody></table></div>;
}
