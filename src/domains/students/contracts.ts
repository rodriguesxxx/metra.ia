import type { AttentionLevel, GradeHistoryPoint, SubjectPerformance } from "@/domains/academics/contracts";
import type { PedagogicalRecord } from "@/domains/pedagogy/contracts";

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

export interface StudentProfile {
  id: string;
  name: string;
  registration: string;
  className: string;
  attentionLevel: AttentionLevel;
  averageGrade?: number;
  attendanceRate?: number;
  courseName?: string;
  courseId?: string;
  classId?: string;
  photoUrl?: string;
  subjects: SubjectPerformance[];
  gradeHistory?: GradeHistoryPoint[];
  records?: PedagogicalRecord[];
}
