/**
 * Contratos de leitura esperados pelo frontend. Substituir/alinhar estes tipos
 * ao OpenAPI do backend quando ele for disponibilizado.
 */
export type AttentionLevel = "normal" | "attention" | "critical";

export interface ClassSummary {
  id: string;
  name: string;
  courseName: string;
  termLabel: string;
  studentCount: number;
  averageGrade?: number;
  attendanceRate?: number;
  attentionStudentCount?: number;
}

export interface StudentListItem {
  id: string;
  name: string;
  registration: string;
  attentionLevel: AttentionLevel;
  averageGrade?: number;
  attendanceRate?: number;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ClassDetails extends ClassSummary {
  subjects: string[];
}

export interface PedagogicalRecordInput {
  studentId: string;
  category: "performance" | "attendance" | "behavior" | "guidance";
  note: string;
}

export interface DashboardSummary {
  attentionStudentCount: number;
  averageGrade: number;
  attendanceRate: number;
  recentDeclineCount: number;
  priorityStudents: Array<Pick<StudentListItem, "id" | "name" | "attentionLevel" | "averageGrade" | "attendanceRate">>;
}
