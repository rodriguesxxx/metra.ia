import "server-only";
import { apiFetch, ApiError } from "@/services/server/api";
import { canReadPedagogicalData } from "@/domains/identity/authorization";
import { getSession } from "@/services/server/session";
import type { StudentProfile } from "@/domains/students/contracts";
import { isMockDataEnabled } from "@/config/data-source";
import { mockStudent } from "@/mocks/education";
import { getMockStudentSupplement } from "@/mocks/students";

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
