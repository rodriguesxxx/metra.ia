import type { ClassSummary } from "@/domains/classes/contracts";
import type { SyncStatus } from "@/lib/sync-status";

export interface CajuiAcademicStudent {
  id: string;
  name?: string;
  registration?: string;
  courseName?: string;
  className?: string;
  averageGrade?: number;
  attendanceRate?: number;
  subjects: Array<{ id?: string; name: string; grade?: number; attendanceRate?: number }>;
}

export interface CajuiClassSnapshot {
  class: ClassSummary;
  students: CajuiAcademicStudent[];
  syncedAt: string;
}

export interface CajuiSyncResult {
  classId: string;
  sync: SyncStatus;
  snapshot?: CajuiClassSnapshot;
}
