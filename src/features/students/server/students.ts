import "server-only";
import { apiFetch } from "@/lib/api";
import type { AttentionLevel } from "@/lib/contracts";
import { isMockDataEnabled } from "@/lib/data-source";
import { mockStudent } from "@/mocks/education";

export interface StudentProfile {
  id: string;
  name: string;
  registration: string;
  className: string;
  attentionLevel: AttentionLevel;
  averageGrade?: number;
  attendanceRate?: number;
  subjects: Array<{ name: string; grade?: number; attendanceRate?: number }>;
}

export function getStudent(id: string) {
  if (isMockDataEnabled()) return Promise.resolve(mockStudent(id));
  return apiFetch<StudentProfile>(`/students/${encodeURIComponent(id)}`);
}
