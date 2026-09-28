import { describe, expect, it } from "vitest";
import { mockClassDetails, mockClassStudents, mockClasses, mockDashboard, mockStudent } from "./education";

describe("education mocks", () => {
  it("mantém referências navegáveis entre turma, estudante e painel", () => {
    const firstStudent = mockClassStudents("info-2a-2026").items[0];
    expect(mockClasses().items.length).toBeGreaterThan(0);
    expect(mockStudent(firstStudent.id)?.id).toBe(firstStudent.id);
    expect(mockDashboard.priorityStudents.some((student) => student.id === firstStudent.id)).toBe(true);
  });

  it("não retorna fallbacks para IDs fora do escopo", () => {
    expect(mockClassDetails("unknown")).toBeUndefined();
    expect(mockClassStudents("unknown").items).toEqual([]);
    expect(mockStudent("unknown")).toBeUndefined();
  });
});
