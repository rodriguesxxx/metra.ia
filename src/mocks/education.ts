import type { ClassCouncilReport } from "@/features/reports/server/class-council-report";
import type { StudentProfile } from "@/features/students/server/students";
import type { ClassDetails, ClassSummary, DashboardSummary, PageResult, StudentListItem } from "@/lib/contracts";

const students: StudentListItem[] = [
  { id: "stu-ana", name: "Ana Clara Ribeiro", registration: "20260184", attentionLevel: "attention", averageGrade: 5.8, attendanceRate: 88 },
  { id: "stu-lucas", name: "Lucas Henrique Silva", registration: "20260231", attentionLevel: "critical", averageGrade: 4.7, attendanceRate: 76 },
  { id: "stu-maria", name: "Maria Eduarda Costa", registration: "20260207", attentionLevel: "normal", averageGrade: 8.6, attendanceRate: 96 },
  { id: "stu-joao", name: "João Pedro Alves", registration: "20260161", attentionLevel: "attention", averageGrade: 6.1, attendanceRate: 82 },
];

const classes: ClassSummary[] = [
  { id: "8a-2026", name: "8º Ano A", courseName: "Ensino Fundamental", termLabel: "2º semestre · 2026", studentCount: 31, averageGrade: 6.4, attendanceRate: 89, attentionStudentCount: 5 },
  { id: "8b-2026", name: "8º Ano B", courseName: "Ensino Fundamental", termLabel: "2º semestre · 2026", studentCount: 29, averageGrade: 7.1, attendanceRate: 93, attentionStudentCount: 2 },
];

export const mockDashboard: DashboardSummary = { attentionStudentCount: 7, averageGrade: 6.7, attendanceRate: 91, recentDeclineCount: 3, priorityStudents: students.slice(0, 3).map(({ id, name, attentionLevel, averageGrade, attendanceRate }) => ({ id, name, attentionLevel, averageGrade, attendanceRate })) };
export const mockClasses = (): PageResult<ClassSummary> => ({ items: classes, page: 1, pageSize: 20, total: classes.length });
export const mockClassDetails = (id: string): ClassDetails => ({ ...(classes.find((item) => item.id === id) ?? classes[0]), subjects: ["Matemática", "Língua Portuguesa", "Ciências", "História"] });
export const mockClassStudents = (query?: string): PageResult<StudentListItem> => { const term = query?.toLocaleLowerCase("pt-BR"); const items = term ? students.filter((student) => `${student.name} ${student.registration}`.toLocaleLowerCase("pt-BR").includes(term)) : students; return { items, page: 1, pageSize: 20, total: items.length }; };
export const mockStudent = (id: string): StudentProfile => { const student = students.find((item) => item.id === id) ?? students[0]; return { ...student, className: "8º Ano A", subjects: [{ name: "Matemática", grade: 5.2, attendanceRate: 88 }, { name: "Língua Portuguesa", grade: student.averageGrade, attendanceRate: student.attendanceRate }, { name: "Ciências", grade: 7.4, attendanceRate: 94 }] }; };
export const mockClassCouncilReport = (classId: string): ClassCouncilReport => ({ classId, className: "8º Ano A", termLabel: "2º semestre · 2026", summary: { studentCount: 31, averageGrade: 6.4, attendanceRate: 89, attentionStudentCount: 5 }, priorities: [{ studentId: "stu-lucas", studentName: "Lucas Henrique Silva", attentionLevel: "critical", reason: "Queda em Matemática e frequência irregular", averageGrade: 4.7, attendanceRate: 76, recentChange: -1.1 }, { studentId: "stu-ana", studentName: "Ana Clara Ribeiro", attentionLevel: "attention", reason: "Acompanhamento de aprendizagem", averageGrade: 5.8, attendanceRate: 88, recentChange: -0.4 }], trends: [{ label: "Frequência", value: 89, change: -2.3, direction: "worsening", context: "Maior ausência às sextas-feiras" }, { label: "Média da turma", value: 6.4, change: 0.5, direction: "improving", context: "Melhora após recuperação paralela" }], referrals: [{ id: "ref-1", title: "Contato com responsáveis", description: "Priorizar estudantes com frequência abaixo de 80%.", status: "pending" }, { id: "ref-2", title: "Plano de recuperação", description: "Retomar habilidades essenciais de Matemática.", status: "in_progress" }] });
