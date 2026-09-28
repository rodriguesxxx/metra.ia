import "server-only";
import { apiFetch, ApiError } from "@/lib/api";
import { canReadPedagogicalData } from "@/features/auth/server/authorization";
import { getSession } from "@/features/auth/server/session";
import type { AttentionLevel, GradeHistoryPoint, PedagogicalRecord, SubjectPerformance } from "@/lib/contracts";
import { isMockDataEnabled } from "@/lib/data-source";
import { mockStudent } from "@/mocks/education";
import { getMockStudentSupplement } from "@/mocks/students";

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

async function readStudent(id: string): Promise<StudentProfile> {
  if (isMockDataEnabled()) {
    const student = mockStudent(id);
    if (!student) throw new ApiError(404, "Estudante não encontrado.");
    const supplement = getMockStudentSupplement(student.id);
    return {
      ...student,
      className: "2º Técnico em Informática A",
      classId: "info-2a-2026",
      courseId: "course-tech-info",
      courseName: supplement.courseName,
      photoUrl: supplement.photoUrl,
      subjects: supplement.subjects,
      gradeHistory: supplement.gradeHistory,
      records: supplement.records,
    };
  }
  return apiFetch<StudentProfile>(`/students/${encodeURIComponent(id)}`);
}

export async function getStudent(id: string) {
  const [student, user] = await Promise.all([readStudent(id), getSession()]);
  if (!user) throw new ApiError(401, "Sessão necessária.");
  if (!canReadPedagogicalData(user, { classId: student.classId, courseId: student.courseId })) {
    throw new ApiError(403, "Você não possui acesso a este estudante.");
  }
  return student;
}

export async function getStudentAcademicScope(id: string) {
  const student = await getStudent(id);
  return { classId: student.classId, courseId: student.courseId };
}
