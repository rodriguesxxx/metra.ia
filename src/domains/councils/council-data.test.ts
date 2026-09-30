import { describe, expect, it } from "vitest";
import type { CouncilReportData } from "@/domains/councils/contracts";
import { filterCouncilStudents, summarizeCouncilStudents } from "@/domains/councils/council-data";

const report: CouncilReportData = {
  classId: "class-a", summary: { averageGrade: 7 }, priorities: [], trends: [], referrals: [],
  subjects: [{ id: "math", name: "Matemática", averageGrade: 6.5 }],
  students: [
    { id: "a", name: "Acima", averageGrade: 8, attendanceRate: 95, subjects: [{ id: "math", name: "Matemática", grade: 8 }] },
    { id: "b", name: "Recuperação", averageGrade: 5, attendanceRate: 80, isInRecovery: true, subjects: [{ id: "math", name: "Matemática", grade: 5, isInRecovery: true }] },
  ],
};

describe("council filters", () => {
  it("inclui igualdade no filtro acima da média", () => {
    const equal = { ...report, students: [{ id: "equal", name: "Igual", averageGrade: 7 }] };
    expect(filterCouncilStudents(equal, new Set(["above_average"])).map((student) => student.id)).toEqual(["equal"]);
  });

  it("preserva correspondência por id OU nome, inclusive ids ausentes", () => {
    const ambiguous: CouncilReportData = {
      ...report,
      subjects: [{ name: "Outra", averageGrade: 9 }, { name: "Matemática", averageGrade: 6 }],
      students: [{ id: "a", name: "Ana", subjects: [{ name: "Matemática", grade: 8 }] }],
    };
    expect(filterCouncilStudents(ambiguous, new Set(["low_subject"]))).toHaveLength(1);
  });

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
