import type { CajuiClassSnapshot, CajuiSyncResult } from "@/services/contracts/cajui";

const snapshots = new Map<string, CajuiClassSnapshot>();
const statuses = new Map<string, CajuiSyncResult>();

function rawSnapshot() {
  return {
    class: { name: "2º Técnico em Informática A", courseId: "course-tech-info", courseName: "Técnico em Informática", termLabel: "2º semestre · 2026", averageGrade: 7.2, attendanceRate: 91 },
    students: [
      { id: "stu-ana", name: "Ana Clara Ribeiro", registration: "20260184", averageGrade: 7.4, attendanceRate: 94, subjects: [{ name: "Matemática", grade: 7.1, attendanceRate: 92 }] },
      { id: "stu-lucas", name: "Lucas Henrique Silva", registration: "20260231", averageGrade: 5.2, attendanceRate: 79, subjects: [{ name: "Matemática", grade: 4.9, attendanceRate: 76 }] },
    ],
  };
}

export function getMockCajuiStatus(classId: string): CajuiSyncResult {
  return statuses.get(classId) ?? { classId, sync: { status: "never" } };
}

export function syncMockCajuiClass(classId: string, normalize: (id: string, payload: unknown, syncedAt: string) => CajuiClassSnapshot): CajuiSyncResult {
  const now = new Date().toISOString();
  const previous = getMockCajuiStatus(classId);
  try {
    // Mocks enter through the same normalization boundary as the provider response.
    const snapshot = normalize(classId, rawSnapshot(), now);
    const result: CajuiSyncResult = { classId, snapshot, sync: { status: "success", attemptedAt: now, lastSuccessfulSyncAt: now } };
    snapshots.set(classId, snapshot);
    statuses.set(classId, result);
    return result;
  } catch {
    const result: CajuiSyncResult = { classId, snapshot: snapshots.get(classId) ?? previous.snapshot, sync: { status: "error", attemptedAt: now, message: "Não foi possível atualizar os dados do Cajuí.", lastSuccessfulSyncAt: previous.sync.lastSuccessfulSyncAt ?? snapshots.get(classId)?.syncedAt } };
    statuses.set(classId, result);
    return result;
  }
}

export function resetMockCajuiIntegration() {
  snapshots.clear();
  statuses.clear();
}
