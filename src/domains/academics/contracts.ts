export type AttentionLevel = "normal" | "attention" | "critical";

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
