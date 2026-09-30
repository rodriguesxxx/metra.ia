export interface PedagogicalRecordInput {
  studentId: string;
  category?: string;
  note: string;
  subjectId?: string;
  period?: string;
}

export interface PedagogicalRecord {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  category?: string;
  categoryLabel?: string;
  subjectId?: string;
  subjectName?: string;
  period?: string;
  note: string;
}
