import type { AttentionLevel, CourseModality, SyncStatus } from "@/lib/contracts";

/**
 * Read model used by the council experience. The API report remains backwards
 * compatible: all fields introduced here are optional additions to its
 * existing summary/priorities/trends/referrals contract.
 */
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
  subjects?: Array<{ id?: string; name: string; grade?: number; attendanceRate?: number; isInRecovery?: boolean }>;
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

export function councilStudents(report: CouncilReportData): CouncilStudent[] {
  if (report.students?.length) return report.students;
  return report.priorities.map((student) => ({
    id: student.studentId,
    name: student.studentName,
    averageGrade: student.averageGrade,
    attendanceRate: student.attendanceRate,
    recentChange: student.recentChange,
    attentionLevel: student.attentionLevel,
    pedagogicalContext: student.reason,
  }));
}

function hasLowSubjectPerformance(student: CouncilStudent, report: CouncilReportData) {
  return student.subjects?.some((subject) => {
    if (subject.grade === undefined) return false;
    const classSubject = report.subjects?.find((item) => item.id === subject.id || item.name === subject.name);
    // Prefer the consolidated class reference; a 6.0 reference is only a
    // neutral fallback when the integration has no per-subject aggregate.
    const reference = classSubject?.averageGrade ?? 6;
    return subject.grade < reference;
  }) ?? false;
}

export function filterCouncilStudents(report: CouncilReportData, filters: ReadonlySet<CouncilFilter>) {
  const classAverage = report.summary.averageGrade;
  return councilStudents(report).filter((student) => {
    if (filters.has("recovery") && !student.isInRecovery && !student.subjects?.some((subject) => subject.isInRecovery)) return false;
    if (filters.has("above_average") && (classAverage === undefined || student.averageGrade === undefined || student.averageGrade < classAverage)) return false;
    if (filters.has("low_subject") && !hasLowSubjectPerformance(student, report)) return false;
    return true;
  });
}

export function summarizeCouncilStudents(students: CouncilStudent[]) {
  const average = (values: Array<number | undefined>) => {
    const valid = values.filter((value): value is number => value !== undefined);
    return valid.length ? valid.reduce((total, value) => total + value, 0) / valid.length : undefined;
  };
  return {
    studentCount: students.length,
    averageGrade: average(students.map((student) => student.averageGrade)),
    attendanceRate: average(students.map((student) => student.attendanceRate)),
    recoveryCount: students.filter((student) => student.isInRecovery || student.subjects?.some((subject) => subject.isInRecovery)).length,
  };
}
