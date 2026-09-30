import type { StudentListItem } from "@/domains/students/contracts";

export interface DashboardSummary {
  attentionStudentCount: number;
  averageGrade: number;
  attendanceRate: number;
  recentDeclineCount: number;
  priorityStudents: Array<Pick<StudentListItem, "id" | "name" | "attentionLevel" | "averageGrade" | "attendanceRate">>;
}
