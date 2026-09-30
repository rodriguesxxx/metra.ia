import "server-only";

import { isMockDataEnabled } from "@/config/data-source";
import { councilDemoClasses, mockCouncilReport } from "@/mocks/council";
import { getClasses } from "./classes";
import { getClassCouncilReport } from "./class-council-report";

export async function getCouncilSelectionClasses() {
  if (isMockDataEnabled()) return councilDemoClasses;
  return (await getClasses()).items;
}

// This richer council fixture also feeds the dashboard. The report endpoint's
// original mock remains separate in class-council-report.ts.
export async function getCouncilWorkspaceReport(classId: string) {
  if (isMockDataEnabled()) return mockCouncilReport(classId);
  return getClassCouncilReport(classId);
}
