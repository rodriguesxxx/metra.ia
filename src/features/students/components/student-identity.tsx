"use client";

import { useState } from "react";
import { StudentAvatar } from "./student-avatar";
import { StudentPhotoUpload } from "./student-photo-upload";

export function StudentIdentity({ studentId, name, registration, photoUrl, canManagePhoto }: { studentId: string; name: string; registration: string; photoUrl?: string; canManagePhoto: boolean }) {
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(photoUrl);
  return <section className="card section" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
    <StudentAvatar name={name} photoUrl={currentPhotoUrl} />
    <div style={{ flex: "1 1 15rem" }}><span className="context-label">Perfil consolidado</span><h2 style={{ marginTop: ".15rem" }}>{name}</h2><p className="lede" style={{ marginTop: ".25rem" }}>Matrícula {registration}</p></div>
    {canManagePhoto ? <StudentPhotoUpload studentId={studentId} onUploaded={setCurrentPhotoUrl} /> : null}
  </section>;
}
