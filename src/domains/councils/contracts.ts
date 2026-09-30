import type { AttentionLevel, SubjectPerformance } from "@/domains/academics/contracts";
import type { CourseModality } from "@/domains/classes/contracts";
import type { SyncStatus } from "@/lib/sync-status";

export interface CouncilSubject {
  id?: string;
  name: string;
  averageGrade?: number;
  attendanceRate?: number;
}

export interface CouncilStudent {
  id: string;
  name: string;
  registration?: string;
  photoUrl?: string;
  courseName?: string;
  className?: string;
  averageGrade?: number;
  attendanceRate?: number;
  isInRecovery?: boolean;
  recentChange?: number;
  pedagogicalContext?: string;
  attentionLevel?: AttentionLevel;
  subjects?: SubjectPerformance[];
}

export interface CouncilReportData {
  classId: string;
  className?: string;
  courseId?: string;
  courseName?: string;
  termLabel?: string;
  modality?: CourseModality;
  councilEligible?: boolean;
  sync?: SyncStatus;
  summary: { studentCount?: number; averageGrade?: number; attendanceRate?: number; attentionStudentCount?: number };
  priorities: Array<{ studentId: string; studentName: string; attentionLevel: AttentionLevel; reason?: string; averageGrade?: number; attendanceRate?: number; recentChange?: number }>;
  trends: Array<{ label: string; value?: number; change?: number; direction?: "improving" | "stable" | "worsening"; context?: string }>;
  referrals: Array<{ id: string; title: string; description?: string; status?: "pending" | "in_progress" | "completed" }>;
  students?: CouncilStudent[];
  subjects?: CouncilSubject[];
}

export type CouncilFilter = "recovery" | "above_average" | "low_subject";
