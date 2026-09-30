"use client";

import { useState } from "react";
import { StudentAvatar } from "./student-avatar";
import { StudentPhotoUpload } from "./student-photo-upload";

export function StudentIdentity({ studentId, name, registration, courseName, className, photoUrl, canManagePhoto }: { studentId: string; name: string; registration: string; courseName?: string; className?: string; photoUrl?: string; canManagePhoto: boolean }) {
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(photoUrl);
  return <section className="card section" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
    {canManagePhoto ? <StudentPhotoUpload studentId={studentId} name={name} photoUrl={currentPhotoUrl} onUploaded={setCurrentPhotoUrl} /> : <StudentAvatar name={name} photoUrl={currentPhotoUrl} />}
    <div style={{ flex: "1 1 15rem" }}><h1 style={{ fontSize: "clamp(1.7rem, 2.5vw, 2.5rem)" }}>{name}</h1><p className="lede" style={{ marginTop: ".3rem" }}>{[courseName, className, `Matrícula ${registration}`].filter(Boolean).join(" · ")}</p></div>
  </section>;
}
