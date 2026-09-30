"use client";

import { useState } from "react";
import { StudentAvatar } from "@/domains/students/components/student-avatar";
import { StudentPhotoUpload } from "./student-photo-upload";

export function EditableStudentAvatar({ studentId, name, photoUrl, canManagePhoto }: { studentId: string; name: string; photoUrl?: string; canManagePhoto: boolean }) {
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(photoUrl);
  return canManagePhoto
    ? <StudentPhotoUpload studentId={studentId} name={name} photoUrl={currentPhotoUrl} onUploaded={setCurrentPhotoUrl} />
    : <StudentAvatar name={name} photoUrl={currentPhotoUrl} />;
}
