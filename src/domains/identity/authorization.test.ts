import { describe, expect, it } from "vitest";
import type { SessionUser } from "@/domains/identity/contracts";
import { canCreatePedagogicalRecord, canManageStudentPhoto, canReadPedagogicalData, canStartCouncil } from "@/domains/identity/authorization";

function user(role: SessionUser["role"], overrides: Partial<SessionUser> = {}): SessionUser {
  return { id: role, name: role, role, permissions: [], courseIds: [], classIds: [], subjectIds: [], ...overrides };
}

describe("academic authorization", () => {
  it("nega ao professor uma turma não vinculada", () => {
    const teacher = user("teacher", { classIds: ["class-a"], subjectIds: ["math"] });
    expect(canReadPedagogicalData(teacher, { classId: "class-b", subjectId: "math" })).toBe(false);
    expect(canCreatePedagogicalRecord(teacher, { classId: "class-b", subjectId: "math" })).toBe(false);
    expect(canStartCouncil({ ...teacher, permissions: ["class-councils:start"] }, { classId: "class-b" })).toBe(false);
  });

  it("limita o coordenador ao próprio curso", () => {
    const coordinator = user("coordinator", { courseIds: ["course-a"] });
    expect(canReadPedagogicalData(coordinator, { courseId: "course-a" })).toBe(true);
    expect(canStartCouncil(coordinator, { courseId: "course-a" })).toBe(true);
    expect(canManageStudentPhoto(coordinator, { courseId: "course-a" })).toBe(true);
    expect(canReadPedagogicalData(coordinator, { courseId: "course-b" })).toBe(false);
    expect(canStartCouncil(coordinator, { courseId: "course-b" })).toBe(false);
    expect(canManageStudentPhoto(coordinator, { courseId: "course-b" })).toBe(false);
  });

  it("não concede dados pedagógicos ao administrador por padrão", () => {
    expect(canReadPedagogicalData(user("administrator"), { courseId: "course-a" })).toBe(false);
    expect(canReadPedagogicalData(user("administrator", { permissions: ["pedagogical:read"] }), { courseId: "course-a" })).toBe(true);
    expect(canCreatePedagogicalRecord(user("administrator", { permissions: ["pedagogical-records:write"] }), { courseId: "course-a" })).toBe(false);
  });

  it("limita professor à própria turma e disciplina, com permissão explícita para iniciar Conselho", () => {
    const teacher = user("teacher", { classIds: ["class-a"], subjectIds: ["math"] });
    expect(canReadPedagogicalData(teacher, { classId: "class-a", subjectId: "math" })).toBe(true);
    expect(canCreatePedagogicalRecord(teacher, { classId: "class-a", subjectId: "math" })).toBe(true);
    expect(canReadPedagogicalData(teacher, { classId: "class-a", subjectId: "biology" })).toBe(false);
    expect(canCreatePedagogicalRecord(teacher, { classId: "class-a", subjectId: "biology" })).toBe(false);
    expect(canStartCouncil(teacher, { classId: "class-a" })).toBe(false);
    expect(canStartCouncil({ ...teacher, permissions: ["class-councils:start"] }, { classId: "class-a" })).toBe(true);
    expect(canManageStudentPhoto(teacher, { classId: "class-a" })).toBe(false);
  });

  it("exige permissão de escrita do coordenador além do vínculo com o curso", () => {
    const coordinator = user("coordinator", { courseIds: ["course-a"] });
    expect(canCreatePedagogicalRecord(coordinator, { courseId: "course-a" })).toBe(false);
    expect(canCreatePedagogicalRecord({ ...coordinator, permissions: ["pedagogical-records:write"] }, { courseId: "course-a" })).toBe(true);
    expect(canCreatePedagogicalRecord({ ...coordinator, permissions: ["pedagogical-records:write"] }, { courseId: "course-b" })).toBe(false);
    expect(canStartCouncil(coordinator, { courseId: "course-a" })).toBe(true);
    expect(canStartCouncil(coordinator, { courseId: "course-b" })).toBe(false);
  });

  it("concede atuação pedagógica sem escopo ou permissões adicionais", () => {
    const pedagogical = user("pedagogical");
    expect(canReadPedagogicalData(pedagogical, {})).toBe(true);
    expect(canCreatePedagogicalRecord(pedagogical, {})).toBe(true);
    expect(canStartCouncil(pedagogical, {})).toBe(true);
    expect(canManageStudentPhoto(pedagogical, {})).toBe(true);
  });

  it("exige leitura e escrita explícitas do administrador e não permite gerir foto", () => {
    const administrator = user("administrator", { permissions: ["pedagogical:read", "pedagogical-records:write", "class-councils:start"] });
    expect(canReadPedagogicalData(administrator, {})).toBe(true);
    expect(canCreatePedagogicalRecord(administrator, {})).toBe(true);
    expect(canStartCouncil(administrator, {})).toBe(true);
    expect(canManageStudentPhoto(administrator, { courseId: "course-a" })).toBe(false);
    expect(canCreatePedagogicalRecord({ ...administrator, permissions: ["pedagogical:read"] }, {})).toBe(false);
    expect(canStartCouncil({ ...administrator, permissions: ["class-councils:start"] }, {})).toBe(false);
  });
});
