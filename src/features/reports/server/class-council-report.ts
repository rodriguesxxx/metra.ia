import "server-only";
import { apiFetch } from "@/lib/api";
import type { AttentionLevel, CourseModality, SyncStatus } from "@/lib/contracts";
import { isMockDataEnabled } from "@/lib/data-source";
import { mockClassCouncilReport } from "@/mocks/education";

/** Contrato temporário; alinhar ao OpenAPI quando a API estiver disponível. */
export interface ClassCouncilReport {
  classId: string;
  className?: string;
  courseId?: string;
  courseName?: string;
  termLabel?: string;
  modality?: CourseModality;
  councilEligible?: boolean;
  sync?: SyncStatus;
  summary: { studentCount?: number; averageGrade?: number; attendanceRate?: number; attentionStudentCount?: number };
  subjects?: Array<{ name: string; averageGrade?: number; attendanceRate?: number }>;
  priorities: Array<{ studentId: string; studentName: string; attentionLevel: AttentionLevel; reason?: string; averageGrade?: number; attendanceRate?: number; recentChange?: number }>;
  trends: Array<{ label: string; value?: number; change?: number; direction?: "improving" | "stable" | "worsening"; context?: string }>;
  referrals: Array<{ id: string; title: string; description?: string; status?: "pending" | "in_progress" | "completed" }>;
}

export function getClassCouncilReport(classId: string) {
  if (isMockDataEnabled()) return Promise.resolve(mockClassCouncilReport(classId));
  return apiFetch<ClassCouncilReport>(`/class-councils/${encodeURIComponent(classId)}/report`);
}
