import { describe, expect, it } from "vitest";
import type { SessionUser } from "./session";
import { canCreatePedagogicalRecord, canManageStudentPhoto, canReadPedagogicalData, canStartCouncil } from "./authorization";

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
});
