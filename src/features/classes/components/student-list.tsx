import Link from "next/link";
import { ArrowRight, UsersRound } from "lucide-react";
import { AttentionBadge } from "@/components/ui/attention-badge";
import type { StudentListItem } from "@/lib/contracts";
import { formatGrade, formatPercent } from "@/lib/formatters";

export function StudentList({ students }: { students: StudentListItem[] }) {
  if (!students.length) return <div className="empty"><UsersRound aria-hidden size={28} /><strong>Nenhum estudante para exibir</strong><p>A lista será atualizada após a sincronização dos dados ou quando a busca encontrar resultados.</p></div>;
  return <div className="table-wrap"><table><caption className="sr-only">Estudantes da turma</caption><thead><tr><th>Estudante</th><th>Matrícula</th><th>Situação</th><th>Média</th><th>Frequência</th><th>Ação</th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td><strong>{student.name}</strong></td><td>{student.registration}</td><td><AttentionBadge level={student.attentionLevel} /></td><td>{formatGrade(student.averageGrade)}</td><td>{formatPercent(student.attendanceRate)}</td><td><Link className="button secondary" href={`/estudantes/${student.id}`}>Ver perfil <ArrowRight size={15} /></Link></td></tr>)}</tbody></table></div>;
}
