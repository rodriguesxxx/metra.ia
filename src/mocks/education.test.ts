import { describe, expect, it } from "vitest";
import { mockClassStudents, mockClasses, mockDashboard, mockStudent } from "./education";

describe("education mocks", () => {
  it("mantém referências navegáveis entre turma, estudante e painel", () => {
    const firstStudent = mockClassStudents().items[0];
    expect(mockClasses().items.length).toBeGreaterThan(0);
    expect(mockStudent(firstStudent.id).id).toBe(firstStudent.id);
    expect(mockDashboard.priorityStudents.some((student) => student.id === firstStudent.id)).toBe(true);
  });
});
