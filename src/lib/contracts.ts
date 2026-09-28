/**
 * Contratos de leitura esperados pelo frontend. Substituir/alinhar estes tipos
 * ao OpenAPI do backend quando ele for disponibilizado.
 */
export type AttentionLevel = "normal" | "attention" | "critical";
export type UserRole = "pedagogical" | "coordinator" | "teacher" | "administrator";
export type CourseModality = "high_school" | "technical" | "subsequent_technical" | "other";

export interface SyncStatus {
  status: "never" | "success" | "error" | "syncing";
  lastSuccessfulSyncAt?: string;
  attemptedAt?: string;
  message?: string;
}

export interface ClassSummary {
  id: string;
  name: string;
  courseName: string;
  termLabel: string;
  studentCount: number;
  averageGrade?: number;
  attendanceRate?: number;
  attentionStudentCount?: number;
  courseId?: string;
  modality?: CourseModality;
  councilEligible?: boolean;
  sync?: SyncStatus;
}

export interface StudentListItem {
  id: string;
  name: string;
  registration: string;
  attentionLevel: AttentionLevel;
  averageGrade?: number;
  attendanceRate?: number;
  isInRecovery?: boolean;
  courseName?: string;
  className?: string;
  photoUrl?: string;
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
  category?: string;
  note: string;
  subjectId?: string;
  period?: string;
}

export interface PedagogicalRecord {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  category?: string;
  categoryLabel?: string;
  subjectId?: string;
  subjectName?: string;
  period?: string;
  note: string;
}

export interface GradeHistoryPoint {
  period: string;
  averageGrade: number;
}

export interface SubjectPerformance {
  id?: string;
  name: string;
  grade?: number;
  attendanceRate?: number;
  isInRecovery?: boolean;
}

export interface DashboardSummary {
  attentionStudentCount: number;
  averageGrade: number;
  attendanceRate: number;
  recentDeclineCount: number;
  priorityStudents: Array<Pick<StudentListItem, "id" | "name" | "attentionLevel" | "averageGrade" | "attendanceRate">>;
}
