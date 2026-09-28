import type { GradeHistoryPoint, PedagogicalRecord, SubjectPerformance } from "@/lib/contracts";

interface MockStudentSupplement {
  courseName: string;
  gradeHistory: GradeHistoryPoint[];
  subjects: SubjectPerformance[];
  records: PedagogicalRecord[];
  photoUrl?: string;
  photo?: { data: Uint8Array; contentType: string };
}

const supplements: Record<string, MockStudentSupplement> = {
  "stu-ana": {
    courseName: "Técnico em Informática",
    gradeHistory: [{ period: "1º bimestre", averageGrade: 6.2 }, { period: "2º bimestre", averageGrade: 5.8 }],
    subjects: [{ name: "Matemática", grade: 5.2, attendanceRate: 88, isInRecovery: true }, { name: "Língua Portuguesa", grade: 6.1, attendanceRate: 91 }, { name: "Ciências", grade: 7.4, attendanceRate: 94 }],
    records: [{ id: "record-ana-1", studentId: "stu-ana", teacherId: "teacher-rafael", teacherName: "Rafael Lima", createdAt: "2026-08-16T14:30:00.000Z", category: "acompanhamento", categoryLabel: "Acompanhamento", subjectName: "Matemática", period: "2º bimestre", note: "Retomou as atividades de recuperação e combinou um plano de estudo semanal." }],
  },
  "stu-lucas": {
    courseName: "Técnico em Informática",
    gradeHistory: [{ period: "1º bimestre", averageGrade: 5.8 }, { period: "2º bimestre", averageGrade: 4.7 }],
    subjects: [{ name: "Matemática", grade: 4.2, attendanceRate: 76, isInRecovery: true }, { name: "Língua Portuguesa", grade: 5.1, attendanceRate: 78, isInRecovery: true }, { name: "Ciências", grade: 4.8, attendanceRate: 81, isInRecovery: true }],
    records: [{ id: "record-lucas-1", studentId: "stu-lucas", teacherId: "teacher-rafael", teacherName: "Rafael Lima", createdAt: "2026-08-18T13:10:00.000Z", category: "dificuldade", categoryLabel: "Dificuldade", subjectName: "Matemática", period: "2º bimestre", note: "Apresentou dificuldade na retomada de frações; será acompanhado na recuperação paralela." }],
  },
  "stu-maria": {
    courseName: "Técnico em Informática",
    gradeHistory: [{ period: "1º bimestre", averageGrade: 8.2 }, { period: "2º bimestre", averageGrade: 8.6 }],
    subjects: [{ name: "Matemática", grade: 8.1, attendanceRate: 96 }, { name: "Língua Portuguesa", grade: 8.8, attendanceRate: 98 }, { name: "Ciências", grade: 8.9, attendanceRate: 95 }],
    records: [],
  },
  "stu-joao": {
    courseName: "Técnico em Informática",
    gradeHistory: [{ period: "1º bimestre", averageGrade: 6.4 }, { period: "2º bimestre", averageGrade: 6.1 }],
    subjects: [{ name: "Matemática", grade: 5.8, attendanceRate: 82 }, { name: "Língua Portuguesa", grade: 6.2, attendanceRate: 85 }, { name: "Ciências", grade: 6.3, attendanceRate: 87 }],
    records: [],
  },
};

function ensureSupplement(studentId: string) {
  return supplements[studentId] ?? (supplements[studentId] = { courseName: "Curso não informado", gradeHistory: [], subjects: [], records: [] });
}

export function getMockStudentSupplement(studentId: string) {
  return ensureSupplement(studentId);
}

/** In-memory only: useful to demonstrate the flow, never presented as durable storage. */
export function createMockPedagogicalRecord(input: { studentId: string; category?: string; note: string; subjectId?: string; period?: string }, author: { id: string; name: string }) {
  const record: PedagogicalRecord = {
    id: `record-demo-${Date.now()}`,
    studentId: input.studentId,
    teacherId: author.id,
    teacherName: author.name,
    createdAt: new Date().toISOString(),
    ...(input.category ? { category: input.category, categoryLabel: input.category } : {}),
    ...(input.subjectId ? { subjectId: input.subjectId } : {}),
    ...(input.period ? { period: input.period } : {}),
    note: input.note,
  };
  ensureSupplement(input.studentId).records.unshift(record);
  return record;
}

export function setMockStudentPhoto(studentId: string, contentType: string, data: Uint8Array) {
  const student = ensureSupplement(studentId);
  student.photo = { contentType, data };
  student.photoUrl = `/api/students/${encodeURIComponent(studentId)}/photo`;
}

export function getMockStudentPhoto(studentId: string) {
  return ensureSupplement(studentId).photo;
}
