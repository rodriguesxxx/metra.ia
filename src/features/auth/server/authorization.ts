import type { SessionUser } from "./session";

export interface AcademicScope {
  classId?: string;
  courseId?: string;
  subjectId?: string;
}

function hasExplicitPermission(user: SessionUser, permission: string) {
  return user.permissions.includes(permission);
}

export function canReadPedagogicalData(user: SessionUser, scope: AcademicScope) {
  if (user.role === "pedagogical") return true;
  if (user.role === "administrator") return hasExplicitPermission(user, "pedagogical:read");
  if (user.role === "coordinator") return Boolean(scope.courseId && user.courseIds.includes(scope.courseId));
  return Boolean(
    scope.classId &&
    user.classIds.includes(scope.classId) &&
    (!scope.subjectId || user.subjectIds.includes(scope.subjectId)),
  );
}

export function canCreatePedagogicalRecord(user: SessionUser, scope: AcademicScope) {
  if (user.role === "pedagogical") return true;
  if (!canReadPedagogicalData(user, scope)) return false;
  if (user.role === "teacher") return true;
  return hasExplicitPermission(user, "pedagogical-records:write");
}

export function canStartCouncil(user: SessionUser, scope: AcademicScope) {
  if (user.role === "pedagogical") return true;
  if (user.role === "coordinator") return Boolean(scope.courseId && user.courseIds.includes(scope.courseId));
  return hasExplicitPermission(user, "class-councils:start") && canReadPedagogicalData(user, scope);
}

export function canManageStudentPhoto(user: SessionUser, scope: AcademicScope) {
  if (user.role === "pedagogical") return true;
  return user.role === "coordinator" && Boolean(scope.courseId && user.courseIds.includes(scope.courseId));
}
