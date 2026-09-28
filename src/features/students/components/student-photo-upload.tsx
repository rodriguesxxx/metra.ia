"use client";

import { useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { MAX_STUDENT_PHOTO_BYTES, validateStudentPhoto } from "@/features/students/photo-validation";

export function StudentPhotoUpload({ studentId, onUploaded }: { studentId: string; onUploaded?: (photoUrl: string) => void }) {
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
  return <div className="error-actions"><input ref={inputRef} className="sr-only" id={`student-photo-${studentId}`} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(event) => void selectFile(event.target.files?.[0])} /><button className="button secondary" type="button" disabled={uploading} onClick={() => inputRef.current?.click()}><Camera size={16} />{uploading ? "Enviando…" : "Cadastrar foto"}</button><span className="context-label"><Upload size={13} aria-hidden /> JPEG, PNG ou WebP · até {MAX_STUDENT_PHOTO_BYTES / 1024 / 1024} MB</span>{message && <span role="status">{message}</span>}{error && <span role="alert">{error}</span>}</div>;
}
