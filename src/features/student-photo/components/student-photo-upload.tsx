"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { StudentAvatar } from "@/domains/students/components/student-avatar";
import { validateStudentPhoto } from "@/domains/students/photo-validation";

export function StudentPhotoUpload({ studentId, name, photoUrl, onUploaded }: { studentId: string; name: string; photoUrl?: string; onUploaded?: (photoUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const selectFile = async (file?: File) => {
    setError(undefined); setMessage(undefined);
    if (!file) return;
    const validationError = validateStudentPhoto(file);
    if (validationError) { setError(validationError); return; }
    setUploading(true);
    try {
      const body = new FormData(); body.set("photo", file);
      const response = await fetch(`/api/students/${encodeURIComponent(studentId)}/photo`, { method: "POST", body, cache: "no-store" });
      const result = await response.json().catch(() => undefined) as { message?: string; photoUrl?: string; transient?: boolean } | undefined;
      if (!response.ok || !result?.photoUrl) { setError(result?.message ?? "Não foi possível enviar a imagem."); return; }
      onUploaded?.(result.photoUrl);
      setMessage(result.transient ? "Foto atualizada para esta sessão de demonstração." : "Foto atualizada.");
    } catch { setError("Não foi possível enviar a imagem."); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  };
  return <div className="student-photo-field"><input ref={inputRef} className="sr-only" id={`student-photo-${studentId}`} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(event) => void selectFile(event.target.files?.[0])} /><button className="student-photo-button" type="button" disabled={uploading} onClick={() => inputRef.current?.click()} aria-label={uploading ? "Enviando foto" : "Alterar foto do estudante"} title="Alterar foto"><StudentAvatar name={name} photoUrl={photoUrl} /><span className="student-photo-camera"><Camera size={16} aria-hidden /></span></button>{message && <span className="student-photo-feedback" role="status">{message}</span>}{error && <span className="student-photo-feedback" role="alert">{error}</span>}</div>;
}
