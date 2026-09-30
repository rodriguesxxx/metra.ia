export type UserRole = "pedagogical" | "coordinator" | "teacher" | "administrator";

export interface SessionUser {
  id: string;
  name: string;
  role: UserRole;
  permissions: string[];
  courseIds: string[];
  classIds: string[];
  subjectIds: string[];
}
