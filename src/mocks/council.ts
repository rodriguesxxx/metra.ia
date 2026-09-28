import type { ClassSummary } from "@/lib/contracts";
import type { CouncilReportData } from "@/features/reports/council-data";

export const councilDemoClasses: ClassSummary[] = [
  {
    id: "info-2a-2026",
    name: "2º Técnico em Informática A",
    courseId: "course-tech-info",
    courseName: "Técnico em Informática",
    termLabel: "2º semestre · 2026",
    studentCount: 28,
    averageGrade: 6.8,
    attendanceRate: 90,
    attentionStudentCount: 4,
    modality: "technical",
    councilEligible: true,
    sync: { status: "success", lastSuccessfulSyncAt: "2026-09-28T16:32:00-03:00" },
  },
];

export function mockCouncilReport(classId: string): CouncilReportData {
  return {
    classId,
    className: "2º Técnico em Informática A",
    courseId: "course-tech-info",
    courseName: "Técnico em Informática",
    termLabel: "2º semestre · 2026",
    modality: "technical",
    councilEligible: true,
    sync: { status: "success", lastSuccessfulSyncAt: "2026-09-28T16:32:00-03:00" },
    summary: { studentCount: 28, averageGrade: 6.8, attendanceRate: 90, attentionStudentCount: 4 },
    subjects: [
      { id: "mat", name: "Matemática", averageGrade: 6.4, attendanceRate: 89 },
      { id: "alg", name: "Algoritmos", averageGrade: 6.7, attendanceRate: 91 },
      { id: "port", name: "Língua Portuguesa", averageGrade: 7.2, attendanceRate: 92 },
    ],
    students: [
      { id: "stu-ana", name: "Ana Clara Ribeiro", registration: "20260184", averageGrade: 6.2, attendanceRate: 88, isInRecovery: true, recentChange: 0.3, pedagogicalContext: "Registros de acompanhamento disponíveis para leitura durante a reunião.", subjects: [{ id: "mat", name: "Matemática", grade: 5.6, attendanceRate: 87, isInRecovery: true }, { id: "alg", name: "Algoritmos", grade: 6.1, attendanceRate: 89 }, { id: "port", name: "Língua Portuguesa", grade: 6.9, attendanceRate: 90 }] },
      { id: "stu-lucas", name: "Lucas Henrique Silva", registration: "20260231", averageGrade: 5.7, attendanceRate: 76, isInRecovery: true, recentChange: -0.8, pedagogicalContext: "Frequência e desempenho devem ser contextualizados pelo Conselho antes de qualquer encaminhamento.", subjects: [{ id: "mat", name: "Matemática", grade: 4.9, attendanceRate: 74, isInRecovery: true }, { id: "alg", name: "Algoritmos", grade: 5.4, attendanceRate: 78, isInRecovery: true }, { id: "port", name: "Língua Portuguesa", grade: 6.8, attendanceRate: 82 }] },
      { id: "stu-maria", name: "Maria Eduarda Costa", registration: "20260207", averageGrade: 8.6, attendanceRate: 96, recentChange: 0.5, subjects: [{ id: "mat", name: "Matemática", grade: 8.1, attendanceRate: 95 }, { id: "alg", name: "Algoritmos", grade: 8.7, attendanceRate: 97 }, { id: "port", name: "Língua Portuguesa", grade: 9, attendanceRate: 96 }] },
      { id: "stu-joao", name: "João Pedro Alves", registration: "20260161", averageGrade: 6.7, attendanceRate: 92, recentChange: 0.2, subjects: [{ id: "mat", name: "Matemática", grade: 6.5, attendanceRate: 91 }, { id: "alg", name: "Algoritmos", grade: 6.2, attendanceRate: 93 }, { id: "port", name: "Língua Portuguesa", grade: 7.4, attendanceRate: 92 }] },
    ],
    priorities: [
      { studentId: "stu-lucas", studentName: "Lucas Henrique Silva", attentionLevel: "attention", reason: "Frequência e desempenho pedem leitura conjunta.", averageGrade: 5.7, attendanceRate: 76, recentChange: -0.8 },
      { studentId: "stu-ana", studentName: "Ana Clara Ribeiro", attentionLevel: "attention", reason: "Em recuperação em Matemática.", averageGrade: 6.2, attendanceRate: 88, recentChange: 0.3 },
    ],
    trends: [{ label: "Frequência", value: 90, change: -1.1, direction: "worsening", context: "Dados acadêmicos consolidados; validar o contexto com os docentes." }, { label: "Média da turma", value: 6.8, change: 0.4, direction: "improving", context: "Variação comparada ao período anterior." }],
    referrals: [{ id: "ref-1", title: "Retomar habilidades essenciais", description: "Encaminhamento a ser validado pelo Conselho.", status: "pending" }],
  };
}
