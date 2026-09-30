import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { deduplicateCajuiStudents, normalizeCajuiSnapshot, syncFailure } from "@/services/server/integrations/cajui";
import { resetMockCajuiIntegration, syncMockCajuiClass } from "@/mocks/integration";

describe("Cajuí adapter", () => {
  it("normaliza apenas campos acadêmicos conhecidos e deduplica alunos de forma determinística", () => {
    const snapshot = normalizeCajuiSnapshot("info-2a-2026", {
      turma: { nome: "2º Técnico em Informática", curso: "Técnico em Informática", periodo: "2026.2" },
      alunos: [
        { alunoId: "student-b", nome: "Beatriz", mediaGlobal: 8.2 },
        { alunoId: "student-a", nome: "André", frequencia: 93, disciplinas: [{ nome: "Redes", nota: 7.8 }] },
        { alunoId: "student-b", nome: "Beatriz Santos", mediaGlobal: 8.2, frequencia: 96, disciplinas: [{ nome: "Programação", nota: 8.5 }] },
      ],
    }, "2026-09-28T17:32:00.000Z");

    expect(snapshot.class).toMatchObject({ id: "info-2a-2026", name: "2º Técnico em Informática", courseName: "Técnico em Informática", studentCount: 2 });
    expect(snapshot.students.map((student) => student.id)).toEqual(["student-a", "student-b"]);
    expect(snapshot.students[1]).toMatchObject({ name: "Beatriz Santos", attendanceRate: 96, subjects: [{ name: "Programação", grade: 8.5 }] });
    expect(snapshot.students[0]).not.toHaveProperty("isInRecovery");
  });

  it("mantém a versão mais completa quando a mesma entidade chega duplicada", () => {
    const students = deduplicateCajuiStudents([
      { id: "student-1", subjects: [] },
      { id: "student-1", name: "Larissa", averageGrade: 7, subjects: [{ name: "Matemática", grade: 7 }] },
    ]);
    expect(students).toEqual([{ id: "student-1", name: "Larissa", averageGrade: 7, subjects: [{ name: "Matemática", grade: 7 }] }]);
  });

  it("prefere a leitura mais recente em duplicatas igualmente completas e rejeita payload vazio", () => {
    const students = deduplicateCajuiStudents([
      { id: "student-1", averageGrade: 6, subjects: [] },
      { id: "student-1", averageGrade: 7.5, subjects: [] },
    ]);
    expect(students[0].averageGrade).toBe(7.5);
    expect(() => normalizeCajuiSnapshot("info-2a-2026", {})).toThrow("snapshot acadêmico inválido");
  });

  it("preserva o último snapshot e timestamp bem-sucedido se a atualização falhar", () => {
    const previous = {
      classId: "info-2a-2026",
      sync: { status: "success" as const, lastSuccessfulSyncAt: "2026-09-28T14:32:00.000Z" },
      snapshot: normalizeCajuiSnapshot("info-2a-2026", { students: [{ id: "student-1", nome: "Larissa" }] }, "2026-09-28T14:32:00.000Z"),
    };

    expect(syncFailure(previous, "2026-09-28T15:00:00.000Z", "Cajuí indisponível.")).toMatchObject({
      classId: "info-2a-2026",
      snapshot: previous.snapshot,
      sync: { status: "error", lastSuccessfulSyncAt: "2026-09-28T14:32:00.000Z", attemptedAt: "2026-09-28T15:00:00.000Z" },
    });
  });

  it("registra sucesso e preserva o estado anterior quando o provedor falha", () => {
    resetMockCajuiIntegration();
    const successful = syncMockCajuiClass("info-2a-2026", normalizeCajuiSnapshot);
    const failed = syncMockCajuiClass("info-2a-2026", () => { throw new Error("Cajuí indisponível"); });

    expect(successful.sync.status).toBe("success");
    expect(successful.snapshot?.class.courseId).toBe("course-tech-info");
    expect(failed).toMatchObject({
      snapshot: successful.snapshot,
      sync: { status: "error", lastSuccessfulSyncAt: successful.sync.lastSuccessfulSyncAt },
    });
  });
});
