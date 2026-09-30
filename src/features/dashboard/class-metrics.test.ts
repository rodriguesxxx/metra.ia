import { describe, expect, it } from "vitest";
import type { ClassSummary } from "@/lib/contracts";
import { summarizeClasses } from "./class-metrics";

const base = { id: "a", name: "A", courseName: "Curso", termLabel: "2026" };

describe("summarizeClasses", () => {
  it("pondera médias pelo número de estudantes e não inventa dados ausentes", () => {
    const classes: ClassSummary[] = [
      { ...base, studentCount: 10, averageGrade: 5, attendanceRate: 80, attentionStudentCount: 2, councilEligible: true },
      { ...base, id: "b", studentCount: 30, averageGrade: 9, attendanceRate: 100, attentionStudentCount: 3 },
      { ...base, id: "c", studentCount: 4 },
    ];
    expect(summarizeClasses(classes)).toEqual({ classCount: 3, studentCount: 44, averageGrade: 8, attendanceRate: 95, attentionStudentCount: 5, attentionAvailable: true, councilClassCount: 1 });
    expect(summarizeClasses([{ ...base, studentCount: 2 }]).averageGrade).toBeUndefined();
  });
});
