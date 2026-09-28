import "server-only";

import { apiFetch, ApiError } from "../../../lib/api";
import type { ClassSummary, SyncStatus } from "../../../lib/contracts";
import { isMockDataEnabled } from "../../../lib/data-source";
import { getMockCajuiStatus, syncMockCajuiClass } from "../../../mocks/integration";

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

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(...values: unknown[]) {
  const value = values.find((item) => typeof item === "string" && item.trim());
  return typeof value === "string" ? value.trim() : undefined;
}

function numberValue(...values: unknown[]) {
  const value = values.find((item) => typeof item === "number" && Number.isFinite(item));
  return typeof value === "number" ? value : undefined;
}

function valueAt(object: JsonObject, ...keys: string[]) {
  return keys.map((key) => object[key]);
}

function toObject(value: unknown) {
  return isObject(value) ? value : {};
}

function sourceStudents(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isObject(payload)) return [];
  for (const key of ["students", "alunos", "items", "results", "data"]) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
}

function sourceSubjects(student: JsonObject) {
  for (const key of ["subjects", "disciplinas", "grades", "notas"]) {
    if (Array.isArray(student[key])) return student[key];
  }
  return [];
}

function normalizeStudent(value: unknown): CajuiAcademicStudent | undefined {
  if (!isObject(value)) return undefined;
  const student = toObject(value.student);
  const id = stringValue(...valueAt(value, "studentId", "student_id", "id", "alunoId", "aluno_id"), ...valueAt(student, "id", "studentId"));
  if (!id) return undefined;

  const subjects = sourceSubjects(value)
    .map((item) => {
      const subject = toObject(item);
      const name = stringValue(...valueAt(subject, "name", "nome", "subjectName", "disciplina"));
      if (!name) return undefined;
      return {
        id: stringValue(...valueAt(subject, "id", "subjectId", "disciplineId", "disciplinaId")),
        name,
        grade: numberValue(...valueAt(subject, "grade", "nota", "averageGrade", "media")),
        attendanceRate: numberValue(...valueAt(subject, "attendanceRate", "frequencia", "frequency")),
      };
    })
    .filter((subject): subject is NonNullable<typeof subject> => Boolean(subject))
    .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));

  return {
    id,
    name: stringValue(...valueAt(value, "name", "nome", "studentName", "alunoNome"), ...valueAt(student, "name", "nome")),
    registration: stringValue(...valueAt(value, "registration", "matricula", "enrollment"), ...valueAt(student, "registration", "matricula")),
    courseName: stringValue(...valueAt(value, "courseName", "curso")),
    className: stringValue(...valueAt(value, "className", "turma")),
    averageGrade: numberValue(...valueAt(value, "averageGrade", "mediaGlobal", "media", "average")),
    attendanceRate: numberValue(...valueAt(value, "attendanceRate", "frequencia", "frequency")),
    subjects,
  };
}

function completeness(student: CajuiAcademicStudent) {
  return Object.values(student).filter((value) => value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0)).length;
}

/** Keeps a single, predictable record for duplicated Cajuí entities. */
export function deduplicateCajuiStudents(students: CajuiAcademicStudent[]) {
  const byId = new Map<string, CajuiAcademicStudent>();
  for (const student of students) {
    const existing = byId.get(student.id);
    if (!existing || completeness(student) >= completeness(existing)) byId.set(student.id, student);
  }
  return [...byId.values()].sort((left, right) => left.id.localeCompare(right.id, "pt-BR"));
}

/**
 * Adapter for the Cajuí payload. It deliberately accepts only academic fields
 * that the integration exposes and never invents attendance, recovery, or
 * pedagogical conclusions.
 */
export function normalizeCajuiSnapshot(classId: string, payload: unknown, syncedAt = new Date().toISOString()): CajuiClassSnapshot {
  const root = toObject(payload);
  const hasClassContainer = isObject(root.class) || isObject(root.turma);
  const hasStudentContainer = ["students", "alunos", "items", "results", "data"].some((key) => Array.isArray(root[key]));
  if (!isObject(payload) || (!hasClassContainer && !hasStudentContainer)) {
    throw new ApiError(502, "O Cajuí retornou um snapshot acadêmico inválido.");
  }
  const classSource = toObject(root.class ?? root.turma);
  const students = deduplicateCajuiStudents(sourceStudents(payload).map(normalizeStudent).filter((student): student is CajuiAcademicStudent => Boolean(student)));
  const name = stringValue(...valueAt(classSource, "name", "nome"), ...valueAt(root, "className", "turma")) ?? classId;
  const courseName = stringValue(...valueAt(classSource, "courseName", "curso", "course"), ...valueAt(root, "courseName", "curso")) ?? "Não informado";

  return {
    class: {
      id: classId,
      name,
      courseName,
      termLabel: stringValue(...valueAt(classSource, "termLabel", "periodo", "period"), ...valueAt(root, "termLabel", "periodo")) ?? "Período não informado",
      studentCount: numberValue(...valueAt(classSource, "studentCount", "totalStudents"), ...valueAt(root, "studentCount", "totalStudents")) ?? students.length,
      averageGrade: numberValue(...valueAt(classSource, "averageGrade", "mediaGlobal", "media"), ...valueAt(root, "averageGrade", "mediaGlobal", "media")),
      attendanceRate: numberValue(...valueAt(classSource, "attendanceRate", "frequencia", "frequency"), ...valueAt(root, "attendanceRate", "frequencia", "frequency")),
      courseId: stringValue(...valueAt(classSource, "courseId", "cursoId"), ...valueAt(root, "courseId", "cursoId")),
    },
    students,
    syncedAt,
  };
}

function normalizeSyncStatus(value: unknown): SyncStatus {
  const source = toObject(value);
  const status = source.status;
  return {
    status: status === "never" || status === "success" || status === "error" || status === "syncing" ? status : "never",
    lastSuccessfulSyncAt: stringValue(source.lastSuccessfulSyncAt),
    attemptedAt: stringValue(source.attemptedAt),
    message: stringValue(source.message),
  };
}

function normalizeSyncResult(classId: string, value: unknown): CajuiSyncResult {
  const source = toObject(value);
  const sync = normalizeSyncStatus(source.sync ?? source);
  const snapshotSource = source.snapshot ?? source.data;
  if (sync.status === "success" && !snapshotSource) {
    throw new ApiError(502, "A sincronização foi concluída sem um snapshot acadêmico válido.");
  }
  return {
    classId,
    sync,
    snapshot: snapshotSource ? normalizeCajuiSnapshot(classId, snapshotSource, sync.lastSuccessfulSyncAt) : undefined,
  };
}

export async function getCajuiSyncStatus(classId: string): Promise<CajuiSyncResult> {
  if (isMockDataEnabled()) return getMockCajuiStatus(classId);
  return normalizeSyncResult(classId, await apiFetch<unknown>(`/integrations/cajui/classes/${encodeURIComponent(classId)}/status`));
}

/** Explicit only: no scheduled or presentation-time synchronization is performed here. */
export async function syncCajuiClass(classId: string): Promise<CajuiSyncResult> {
  if (isMockDataEnabled()) return syncMockCajuiClass(classId, normalizeCajuiSnapshot);
  return normalizeSyncResult(classId, await apiFetch<unknown>(`/integrations/cajui/classes/${encodeURIComponent(classId)}/sync`, { method: "POST" }));
}

export function syncFailure(previous: CajuiSyncResult | undefined, attemptedAt: string, message: string): CajuiSyncResult {
  return {
    classId: previous?.classId ?? "",
    snapshot: previous?.snapshot,
    sync: {
      status: "error",
      attemptedAt,
      message,
      lastSuccessfulSyncAt: previous?.sync.lastSuccessfulSyncAt ?? previous?.snapshot?.syncedAt,
    },
  };
}
