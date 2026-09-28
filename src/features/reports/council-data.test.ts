import { describe, expect, it } from "vitest";
import { filterCouncilStudents, summarizeCouncilStudents, type CouncilReportData } from "./council-data";

const report: CouncilReportData = {
  classId: "class-a", summary: { averageGrade: 7 }, priorities: [], trends: [], referrals: [],
  subjects: [{ id: "math", name: "Matemática", averageGrade: 6.5 }],
  students: [
    { id: "a", name: "Acima", averageGrade: 8, attendanceRate: 95, subjects: [{ id: "math", name: "Matemática", grade: 8 }] },
    { id: "b", name: "Recuperação", averageGrade: 5, attendanceRate: 80, isInRecovery: true, subjects: [{ id: "math", name: "Matemática", grade: 5, isInRecovery: true }] },
  ],
};

describe("council filters", () => {
  it("altera efetivamente os estudantes e métricas da seleção", () => {
    const students = filterCouncilStudents(report, new Set(["recovery"]));
    expect(students.map((student) => student.id)).toEqual(["b"]);
    expect(summarizeCouncilStudents(students)).toMatchObject({ studentCount: 1, averageGrade: 5, recoveryCount: 1 });
  });

  it("combina filtros sem transformar evidência em rótulo pedagógico", () => {
    expect(filterCouncilStudents(report, new Set(["above_average", "low_subject"]))).toHaveLength(0);
    expect(filterCouncilStudents(report, new Set(["low_subject"])).map((student) => student.id)).toEqual(["b"]);
  });
});
