import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import type { ClassSummary } from "@/lib/contracts";
import { formatGrade, formatPercent } from "@/lib/formatters";

export function ClassList({ classes }: { classes: ClassSummary[] }) {
  if (!classes.length) return <div className="empty"><GraduationCap aria-hidden size={28} /><strong>Nenhuma turma encontrada</strong><p>Altere os filtros ou aguarde a sincronização dos dados acadêmicos.</p></div>;
  return <div className="table-wrap"><table><caption className="sr-only">Turmas disponíveis</caption><thead><tr><th>Turma</th><th>Curso</th><th>Estudantes</th><th>Média</th><th>Frequência</th><th>Ação</th></tr></thead><tbody>{classes.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><br /><small>{item.termLabel}</small></td><td>{item.courseName}</td><td>{item.studentCount}</td><td>{formatGrade(item.averageGrade)}</td><td>{formatPercent(item.attendanceRate)}</td><td><Link href={`/turmas/${item.id}`} className="button secondary">Abrir <ArrowRight size={15} /></Link></td></tr>)}</tbody></table></div>;
}
