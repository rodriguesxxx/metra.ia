import type { SyncStatus } from "@/lib/sync-status";

export type CourseModality = "high_school" | "technical" | "subsequent_technical" | "other";

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

export interface ClassDetails extends ClassSummary {
  subjects: string[];
}
