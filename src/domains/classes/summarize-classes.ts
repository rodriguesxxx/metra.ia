import type { ClassSummary } from "@/domains/classes/contracts";

function weightedMean(classes: ClassSummary[], key: "averageGrade" | "attendanceRate") {
  const measured = classes.filter((item) => Number.isFinite(item[key]) && item.studentCount > 0);
  const students = measured.reduce((total, item) => total + item.studentCount, 0);
  if (!students) return undefined;
  return measured.reduce((total, item) => total + item[key]! * item.studentCount, 0) / students;
}

export function summarizeClasses(classes: ClassSummary[]) {
  return {
    classCount: classes.length,
    studentCount: classes.reduce((total, item) => total + item.studentCount, 0),
    averageGrade: weightedMean(classes, "averageGrade"),
    attendanceRate: weightedMean(classes, "attendanceRate"),
    attentionStudentCount: classes.reduce((total, item) => total + (item.attentionStudentCount ?? 0), 0),
    attentionAvailable: classes.some((item) => item.attentionStudentCount !== undefined),
    councilClassCount: classes.filter((item) => item.councilEligible).length,
  };
}
